import { Flavor } from "helpers";
import { CommandSetsRecord, RepositoryBase } from "./core";

export type CommandSetsID = Flavor<number, "CommandSet ID">;

export interface UnsavedCommandSetsRecord {
  PartNumber?: string;
  BOMRevision?: string;
  Name: string;
  Version: number;
  Description: string;
  FilePath: string;
}

export interface SavedCommandSetRecord extends UnsavedCommandSetsRecord {
  ID: CommandSetsID;
}

export class CommandSetsRecordRepository extends RepositoryBase(CommandSetsRecord) {
  getCommandSetForMemoryMap = async (memoryMapID: number) => {
    const commandSet = await this.db.raw(
      `SELECT CommandSets.Name, CommandSets.Version, CommandSets.Description, CommandSets.FilePath FROM CommandSets JOIN MemoryMaps ON CommandSets.ID = MemoryMaps.CommandSetID WHERE MemoryMaps.ID = ${memoryMapID}`
    );

    return commandSet;
  };
}
