import * as Hexagonal from "atomic-object/hexagonal";
import { MesSecurity } from "rest-endpoints/mes-security";

export const MesSecurityPort = Hexagonal.port<MesSecurity, "mesSecurity">("mesSecurity");
export type MesSecurityPortType = typeof MesSecurityPort;
