import { Flavor } from "helpers";
import { CommandSetsID } from "./commandsets";
import { FirmwareID } from "./firmware";
import { MemoryMapsRecord, RepositoryBase } from "./core";

export type MemoryMapsID = Flavor<number, "MemoryMap ID">;

export interface UnsavedMemoryMapsRecord {
  PartNumber: string;
  Description: string;
  BOMRevision: string;
  InternalRevision: number;
  FirmwareID?: FirmwareID;
  CommandSetID: CommandSetsID;
  AncestorID?: number;
}

export interface SavedMemoryMapsRecord extends UnsavedMemoryMapsRecord {
  ID: MemoryMapsID;
}

export class MemoryMapsRecordRepository extends RepositoryBase(MemoryMapsRecord) {
  getAllMemoryMaps = async (): Promise<Array<SavedMemoryMapsRecord>> => {
    const memoryMaps: Array<SavedMemoryMapsRecord> = await this.db("MemoryMaps").select("*");
    return memoryMaps;
  };

  getMemoryMapID = async (memoryMapName: string, bomRevision: string, version: number) => {
    const memoryMapID: [{ ID: number }] = (await this.db("MemoryMaps")
      .select("MemoryMaps.ID")
      .where("MemoryMaps.PartNumber", "=", memoryMapName)
      .and.where("MemoryMaps.BOMRevision", "=", bomRevision)
      .and.where("MemoryMaps.InternalRevision", "=", version)) as [{ ID: number }];

    if (memoryMapID.length > 0) {
      return memoryMapID[0].ID;
    }
    return null;
  };

  getMemoryMapCommands = async (memoryMapName: string, bomRevision: string, version: number) => {
    const memoryMapCommands: Array<string> = await this.db.raw(`SElECT DISTINCT CommandSetData.Command 
      FROM MemoryMaps JOIN MemoryMapData ON MemoryMaps.ID = MemoryMapData.MemoryMapID 
      JOIN CommandSetData ON MemoryMapData.CommandSetDataID = CommandSetData.ID 
      WHERE MemoryMaps.PartNumber = '${memoryMapName}'
      AND MemoryMaps.BOMRevision = '${bomRevision}' 
      AND MemoryMaps.InternalRevision = ${version}
  `);
    return memoryMapCommands;
  };

  isWorkingCopy = async (memoryMapName: string, bomRevision: string, version: number) => {
    const sortedMemoryMaps: Array<Partial<SavedMemoryMapsRecord>> = await this.db("MemoryMaps")
      .select("MemoryMaps.PartNumber")
      .select("MemoryMaps.BOMRevision")
      .select("MemoryMaps.InternalRevision")
      .where("MemoryMaps.PartNumber", "=", memoryMapName)
      .and.where("MemoryMaps.BOMRevision", "=", bomRevision)
      .orderBy("MemoryMaps.PartNumber", "asc")
      .orderBy("MemoryMaps.BOMRevision", "asc")
      .orderBy("InternalRevision", "asc");

    const lastMemoryMap = sortedMemoryMaps.at(-1);

    if (
      lastMemoryMap?.PartNumber === memoryMapName &&
      lastMemoryMap.BOMRevision?.trim() === bomRevision &&
      lastMemoryMap.InternalRevision === version
    ) {
      return true;
    }
    return false;
  };
}
