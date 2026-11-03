import { Flavor } from "helpers";
import { MemoryMapsID } from "./memorymaps";
import { PartNumbersRecord, RepositoryBase } from "./core";

export type PartNumbersID = Flavor<number, "PartNumber ID">;

export interface UnsavedPartNumbersRecord {
  PartNumber: string;
  BOMRevision: string;
  ParentPartNumberID?: number;
  Description: string;
  MemoryMapID: MemoryMapsID;
}

export interface SavedPartNumbersRecord extends UnsavedPartNumbersRecord {
  ID: PartNumbersID;
}

export class PartNumbersRecordRepository extends RepositoryBase(PartNumbersRecord) {
  getPartNumbersForMemoryMap = async (memoryMapName: string, bomRevision: string, version: number) => {
    const partNumbers = await this.db.raw(`
      SELECT PartNumbers.PartNumber
      , PartNumbers.Description
      , PartNumbers.MemoryMapID
      , PartNumbers.ID
      FROM PartNumbers
      JOIN MemoryMaps ON PartNumbers.MemoryMapID = MemoryMaps.ID
      WHERE MemoryMaps.PartNumber = '${memoryMapName}' 
      AND MemoryMaps.BOMRevision = '${bomRevision}' 
      AND MemoryMaps.InternalRevision = ${version}
      `);

    return partNumbers;
  };

  getPartNumberValuesByMemoryMap = async (memoryMapName: string, bomRevision: string, version: number) => {
    const partNumberValues = await this.db.raw(`
      SELECT PartNumbers.PartNumber
      , MemoryMaps.BOMRevision
      , ParentPartNumberID
      , PartNumbers.Description
      , PartNumbers.MemoryMapID
      , PartNumbers.ID
      , MemoryMapValues.PartNumberValue
      FROM PartNumbers
      JOIN MemoryMaps ON PartNumbers.MemoryMapID = MemoryMaps.ID
      JOIN MemoryMapValues ON PartNumbers.ID = MemoryMapValues.PartNumberID
      WHERE MemoryMaps.PartNumber = '${memoryMapName}' 
      AND MemoryMaps.BOMRevision = '${bomRevision}' 
      AND MemoryMaps.InternalRevision = ${version}
      `);

    return partNumberValues;
  };
  getPartNumberValuesByMemoryMapIDAndPartNumberID = async (memoryMapID: number, partNumberID: number) => {
    const partNumberValueArray: {
      PartNumber: string;
      ID: number;
      PartNumberValue: string;
      Command: string;
      Parameter: string;
    }[] = await this.db.raw(`
      SELECT PartNumbers.PartNumber
      , PartNumbers.ID
      , MemoryMapValues.PartNumberValue
      , CommandSetData.Command
      , CommandSetData.Parameter
      FROM PartNumbers
      JOIN MemoryMaps ON PartNumbers.MemoryMapID = MemoryMaps.ID
      JOIN MemoryMapValues ON PartNumbers.ID = MemoryMapValues.PartNumberID
      JOIN MemoryMapData ON MemoryMapData.ID = MemoryMapValues.MemoryMapDataID
	    JOIN CommandSetData ON CommandSetData.ID = MemoryMapData.CommandSetDataID
      WHERE PartNumbers.ID = ${partNumberID} AND PartNumbers.MemoryMapID = ${memoryMapID}
      `);

    return partNumberValueArray;
  };
}
