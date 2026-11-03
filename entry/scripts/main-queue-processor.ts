import { Context } from "context";
import { makeJobProcessorFunction } from "atomic-object/jobs/processing-function";
import { BullJobRunner } from "atomic-object/jobs/bull-runner";
import * as Logger from "atomic-object/logger";
import myConfig from "config";

const runner = new BullJobRunner(myConfig.get("redis.prefix"));

console.info("Loaded main queue worker");

export default makeJobProcessorFunction({
  buildLogger: (job: any) =>
    Logger.makeDecoratedLogger(Logger.Logger, (message: { message: string }) =>
      Object.assign(message, {
        backgroundJobName: job?.data.type,
        backgroundJobId: job?.id,
      })
    ),
  buildContext: (opts: any) =>
    new Context({
      // giving the worker a JobRunner so that jobs may queue jobs
      jobs: runner,
      ...opts,
    }),
  jobs: [],
});
