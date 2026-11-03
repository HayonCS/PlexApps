import * as Hexagonal from "atomic-object/hexagonal";
import { ActiveDirectory } from "rest-endpoints/active-directory";

export const ActiveDirectoryPort = Hexagonal.port<ActiveDirectory, "activeDirectory">("activeDirectory");
export type ActiveDirectoryPortType = typeof ActiveDirectoryPort;
