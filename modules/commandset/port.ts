import * as Hexagonal from "atomic-object/hexagonal";
import { CommandSet } from "./";

export const CommandSetPort = Hexagonal.port<CommandSet, "commandSet">("commandSet");
export type CommandSetPortType = typeof CommandSetPort;
