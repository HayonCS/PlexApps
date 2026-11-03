import * as Hexagonal from "atomic-object/hexagonal";

import { BullJobRunner } from "./bull-runner";

export const JobRunnerPort = Hexagonal.port<BullJobRunner, "bullJobRunner">("bullJobRunner");
export type JobRunnerPortType = typeof JobRunnerPort;
