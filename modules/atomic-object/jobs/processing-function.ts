import * as Logger from "atomic-object/logger";

import { Context } from "atomic-object/hexagonal/context";
import { Job } from "bull";
import { JobSpec } from "atomic-object/jobs";

export function makeJobProcessorFunction(args: {
  buildLogger?: (job?: Job) => Logger.Type;
  buildContext: (opts?: { logger?: Logger.Type; userName?: string; appKey?: string }) => Context;
  jobs: JobSpec[];
}): (job: Job) => Promise<any> {
  const { buildContext, buildLogger, jobs } = args;
  const jobMap: Map<string, JobSpec> = new Map();

  console.info(jobs);

  return async (job: Job) => {
    const logger = buildLogger ? buildLogger(job) : Logger.NullLogger;
    const ctx = buildContext({
      logger: logger,
      userName: job.data.userName,
      appKey: job.data.appKey,
    });

    logger.debug(`${job.data.type} - job starting`);
    const startTime = process.hrtime();

    try {
      const spec = jobMap.get(job.data.type);
      if (!spec) {
        throw new Error(`Didn't know how to process job of type ${job.data.type}`);
      }

      const saveOutcome = async (o: any) => {
        await job.update({ ...job.data, outcome: o });
      };

      await spec.process({
        payload: job.data.payload,
        ctx,
        job,
        logger,
        saveOutcome,
      });

      const endTime = process.hrtime(startTime);
      logger.debug(`${job.data.type} - job completed`, {
        duration: endTime[0] * 1e3 + endTime[1] * 1e-6,
      });
    } catch (ex) {
      const endTime = process.hrtime(startTime);
      logger.error(`${job.data.type} - job failed`, {
        duration: endTime[0] * 1e3 + endTime[1] * 1e-6,
        exception: ex,
      });
      throw ex;
    } finally {
      if ("destroy" in ctx) {
        await (ctx as any).destroy();
      }
    }
  };
}
