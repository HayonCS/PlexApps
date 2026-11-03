/**
 * Provides a typesafe wrapper around `Bull` with some tooling to support
 * integration testing. A `JobSpec` is a value that represents a kind of
 * background job.
 *
 * The service layer typically uses `declare` and `processWithContext` to create `JobSpec` values
 * for operations that should be deferred until after an HTTP request and executed with retry semantics.
 *
 * These jobs are then registered with the `BullJobRunner`, which can be used to
 * `enqueue` a job, causing it to be run at a later time. The runner is also
 * responsible for setting up the `Bull` tasks in the worker process.
 *
 * In addition to type safety, this infrastructure also takes care of instantiating
 * a context for each job and providing dependencies.
 */

import * as bull from "bull";

import { Context } from "atomic-object/hexagonal/context";
import { Flavor } from "helpers";
import { Type as Logger } from "atomic-object/logger";

/** The name of the queue, can be expanded to support more */
export type Queues = "main"; // | 'more' | 'queues'

/** The shape of a function invoked by the job system. */
export type JobProcessFunction<TData, TOutcome> = (args: {
  ctx: Context;
  payload: TData;
  logger: Logger;
  saveOutcome: (outcome: TOutcome) => Promise<void>;
  job: bull.Job<StandardJobData<TData, TOutcome>>;
}) => Promise<any>;

export type StandardJobData<TData, TOutcome> = {
  type: string;
  payload: TData;
  outcome: null | TOutcome;
  userName?: string;
  appKey?: string;
};
export type StandardJob<TData = unknown, TOutcome = unknown> = bull.Job<StandardJobData<TData, TOutcome>>;

/**
 * Represents a kind of background job, including type information for
 * inputs/outputs and the code implementing the job process
 **/
export interface JobSpec<TData = any, TIdentifier extends string = string, TOutcome = any> {
  readonly identifier: TIdentifier;
  process: JobProcessFunction<TData, TOutcome>;
  queue: Queues;
  retryable: boolean;
  delayMilliseconds?: number;
}

type JobArgs<TData, TIdentifier extends string, TOutcome> = {
  identifier: TIdentifier;
  process: JobProcessFunction<TData, TOutcome>;
  retryable: boolean;
  delayMilliseconds?: number;
  queue?: Queues;
};

/** Declares a job. The `process` argument should be a return of `processWithContext`. */
export function declare<TData, TIdentifier extends string, TOutcome>(
  args: JobArgs<TData, TIdentifier, TOutcome>
): JobSpec<TData, TIdentifier, TOutcome> {
  return {
    identifier: args.identifier,
    process: args.process,
    queue: args.queue || "main",
    retryable: args.retryable,
    delayMilliseconds: args.delayMilliseconds,
  };
}

/** Properly types the `process` argument to `declare`. */
export function processWithContext<TData, TOutcome = any>(
  process: JobProcessFunction<TData, TOutcome>
): JobProcessFunction<TData, TOutcome> {
  return process;
}

export type JobId = Flavor<string, "A bull job ID">;
