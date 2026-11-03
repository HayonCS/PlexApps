import { Flavor } from "helpers";
import { CommandSetDataDataType, DirectionType } from "modules/core/types";
import { CommandSetsID } from "./commandsets";
import { CommandSetDataRecord, RepositoryBase } from "./core";

export type CommandSetDataID = Flavor<number, "CommandSetData ID">;

export interface UnsavedCommandSetDataRecord {
  CommandSetID: CommandSetsID;
  Command: string;
  Parameter: string;
  Direction: DirectionType;
  DataType: CommandSetDataDataType;
  DefaultValue: string;
  DefaultLowLimit: string;
  DefaultHighLimit: string;
}

export interface SavedCommandSetDataRecord extends UnsavedCommandSetDataRecord {
  ID: CommandSetDataID;
}

export class CommandSetDataRecordRepository extends RepositoryBase(CommandSetDataRecord) {}
