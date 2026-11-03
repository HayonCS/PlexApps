import * as Hexagonal from "atomic-object/hexagonal";
import { Freshservice } from "domain-services/freshservice";

export const FreshservicePort = Hexagonal.port<Freshservice, "freshservice">("freshservice");
export type FreshservicePortType = typeof FreshservicePort;
