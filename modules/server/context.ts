// import { JobRunner } from "atomic-object/jobs/mapping";

import { Context, ContextOpts } from "context";

export function buildContext(opts: ContextOpts = {}) {
  return new Context({
    // jobs: jobRunner,
    ...opts,
  });
}
