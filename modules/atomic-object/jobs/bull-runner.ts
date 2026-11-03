/*eslint-disable  @typescript-eslint/no-unused-vars*/
import * as Job from "atomic-object/jobs";
import config from "config";

import { Context } from "atomic-object/hexagonal/context";
import { Logger } from "atomic-object/logger";
import { makeJobProcessorFunction } from "./processing-function";

import Bull from "bull";

const NUM_JOB_RETRIES = 5;

type Queues = Job.Queues;

const notConcurrent = <T>(proc: () => PromiseLike<T>) => {
  let inFlight: Promise<T> | false = false;

  return () => {
    if (!inFlight) {
      inFlight = (async () => {
        try {
          return await proc();
        } finally {
          inFlight = false;
        }
      })();
    }
    return inFlight;
  };
};

/**
 * Used to enqueue jobs in server code. Use the `runAll` method to execute jobs
 * in unit tests.
 */
export class BullJobRunner {
  _drainer: null | ((queue: Queues) => void);
  _queues: Map<Queues, Bull.Queue>;

  _registeredJobs: Set<Job.JobSpec>;
  _isSetup: boolean;
  private readonly buildContext: () => Context;

  constructor(
    private readonly prefix: string,
    private readonly userName?: string,
    private readonly appKey?: string,
    buildContext?: () => Context
  ) {
    this.buildContext =
      buildContext ||
      (() => {
        throw new Error("execution not supported");
      });
    this._drainer = null;
    this._isSetup = false;

    this._queues = new Map<Queues, Bull.Queue>([
      [
        "main",
        new Bull("main", {
          prefix,
          redis: config.get("redis.url"),
        }),
      ],
    ]);

    this._registeredJobs = new Set();
  }

  _setup = notConcurrent(async () => {
    if (process.env.NODE_ENV !== "test") {
      throw new Error();
    }
    if (this._isSetup) return;
    this._isSetup = true;

    for (const [qname, queue] of this._queues.entries()) {
      await queue.pause();

      const processFn = makeJobProcessorFunction({
        buildContext: this.buildContext,
        jobs: Array.from(this._registeredJobs.keys()),
      });
      void queue.process(processFn);

      queue.on("drained", this._onDrained.bind(this, qname));
    }
  });

  private _onDrained = (queue: Queues) => {
    if (this._drainer) this._drainer(queue);
  };

  register(...specs: Job.JobSpec[]) {
    if (this._isSetup) {
      throw new Error("Can't register jobs after starting");
    }

    for (const job of specs) {
      this._registeredJobs.add(job);
    }
  }

  async enqueue<TData, TIdentifier extends string, TArg extends TData, TOutcome>(
    spec: Job.JobSpec<TData, TIdentifier, TOutcome>,
    {
      data,
      outcome,
      extraBullOpts = {},
    }: {
      data: TArg;
      outcome?: TOutcome;
      extraBullOpts?: Bull.JobOptions;
    }
  ): Promise<Job.JobId> {
    const queue = this._queues.get(spec.queue)!;
    const { jobData, options } = bullJobDataFromJobSpec(spec, {
      data,
      outcome,
      extraBullOpts,
      userName: this.userName,
      appKey: this.appKey,
    });

    if (spec.delayMilliseconds != undefined) {
      Logger.info(`Enqueuing ${spec.identifier} job with delay of ${spec.delayMilliseconds} ms`);
    }

    const bullJob = await queue.add(jobData, options);
    return bullJob.id as any;
  }

  async enqueueJobs<TData, TIdentifier extends string, TArg extends TData, TOutcome>(
    spec: Job.JobSpec<TData, TIdentifier>,
    params: {
      data: TArg;
      extraBullOpts?: Bull.JobOptions;
    }[]
  ): Promise<Job.JobId[]> {
    function notNull<TValue>(value: TValue | null): value is TValue {
      return value !== null;
    }
    const results = await Promise.all(
      params.map(async (p) => {
        let result = null;
        try {
          result = await this.enqueue(spec, p);
        } catch (e) {
          Logger.error(e);
        }
        return result;
      })
    );
    return results.filter(notNull);
  }

  async getJob<TData, TIdentifier extends string, TOutcome>(
    spec: Job.JobSpec<TData, TIdentifier, TOutcome>,
    id: Job.JobId
  ): Promise<Job.StandardJob<TData, TOutcome>> {
    const queue = this._queues.get(spec.queue)!;
    return (await queue.getJob(id))!;
  }

  async start() {
    await this._setup();

    for (const [name, queue] of this._queues.entries()) {
      await queue.resume();
    }
  }

  async stop() {
    for (const queue of this._queues.values()) {
      await queue.pause();
    }
  }

  async jobCounts() {
    return (
      await Promise.all(
        [...this._queues.entries()].map(async ([name, queue]) => {
          return await queue.getJobCounts();
        })
      )
    ).reduce((count1, count2) => {
      return {
        active: count1.active + count2.active,
        completed: count1.completed + count2.completed,
        delayed: count1.delayed + count2.delayed,
        failed: count1.failed + count2.failed,
        waiting: count1.waiting + count2.waiting,
      };
    });
  }

  /**
   * Runs all enqueued jobs and awaits their completion. Used in tests to
   * validate side effects of jobs. Jobs enqueued in tests don't execute unless
   * this is called.
   */
  async runAll(ignoreEmpty = false) {
    await this._setup();
    const queuesToWait = new Set<Queues>();
    for (const [name, queue] of this._queues.entries()) {
      const counts = await queue.getJobCounts();
      const jobCount = counts.waiting + counts.active + (counts as any).paused;

      if (jobCount > 0) {
        queuesToWait.add(name);
      }
    }

    if (queuesToWait.size === 0) {
      if (ignoreEmpty) {
        return;
      } else {
        throw new Error("Bad news: no jobs (Did you forget to await?)");
      }
    }

    const drainPromise = new Promise<void>((resolve, reject) => {
      this._drainer = (q) => {
        queuesToWait.delete(q);
        void this._queues.get(q)!.pause();

        if (queuesToWait.size === 0) {
          void this.stop();
          this._drainer = null;
          resolve();
        }
      };
    });
    void this.start();
    await drainPromise;
  }

  async close() {
    for (const [name, queue] of this._queues.entries()) {
      await queue.empty();
      await queue.close();
    }
  }
}

export function bullJobDataFromJobSpec<TData, TIdentifier extends string, TArg extends TData, TOutcome>(
  spec: Job.JobSpec<TData, TIdentifier, TOutcome>,
  {
    data,
    extraBullOpts = {},
    userName,
    appKey,
  }: {
    data: TArg;
    outcome?: TOutcome;
    extraBullOpts?: Bull.JobOptions;
    userName?: string;
    appKey?: string;
  }
): { jobData: Job.StandardJobData<TArg, TOutcome>; options: Bull.JobOptions } {
  const jobData: Job.StandardJobData<TArg, TOutcome> = {
    type: spec.identifier,
    payload: data,
    outcome: null,
    userName,
    appKey,
  };
  const retryableOpt: Bull.JobOptions = spec.retryable ? { attempts: NUM_JOB_RETRIES } : {};
  const delayOpt: Bull.JobOptions = spec.delayMilliseconds ? { delay: spec.delayMilliseconds } : {};
  const options: Bull.JobOptions = {
    ...extraBullOpts,
    ...retryableOpt,
    ...delayOpt,
  };
  return { jobData, options };
}

// export class NoopJobRunner implements JobQueuer {
//   _drainer: JobQueuer["_drainer"] = null as any;
//   _isSetup: JobQueuer["_isSetup"] = null as any;
//   _queues: JobQueuer["_queues"] = null as any;
//   _registeredJobs: JobQueuer["_registeredJobs"] = null as any;
//   _setup: JobQueuer["_setup"] = null as any;
//   async register() {
//     /**/
//   }

//   async enqueue() {
//     return "nope";
//   }
//   enqueueJobs: JobQueuer["enqueueJobs"] = null as any;
//   getJob: JobQueuer["getJob"] = null as any;
//   jobCounts: JobQueuer["jobCounts"] = null as any;
//   runAll: JobQueuer["runAll"] = null as any;
//   async close() {
//     /**/
//   }
// }

// export interface JobQueuer /* eslint-disable-line @typescript-eslint/no-empty-interface */
//   extends Pick<BullJobRunner, Omit<keyof BullJobRunner, "start" | "stop">> {}
