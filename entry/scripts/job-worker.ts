import Bull from "bull";
import config from "config";
import process from "./main-queue-processor";

const mainQueue = new Bull("main", {
  redis: {
    path: config.get("redis.url"),
    enableTLSForSentinelMode: false,
    tls: undefined,
    maxRetriesPerRequest: null,
  },
  prefix: config.get("redis.prefix"),
});

console.info(`Starting ${config.get<number>("jobs.workers")} workers (job-worker.ts)`);

void mainQueue.process(config.get<number>("jobs.workers"), process);

void mainQueue.resume();
