import { Flavor } from "helpers";
import { MemoryMapDataRecord, RepositoryBase } from "./core";
import { SavedCommandSetDataRecord } from "./commandsetdata";

export type MemoryMapDataID = Flavor<number, "MemoryMapData ID">;

export interface UnsavedMemoryMapDataRecord {
  MemoryMapID: number;
  CommandSetDataID: number;
  LL: string;
  Value: string;
  HL: string;
  Description: string;
  Units?: string;
}

export interface SavedMemoryMapDataRecord extends UnsavedMemoryMapDataRecord {
  ID: MemoryMapDataID;
}

export class MemoryMapDataRecordRepository extends RepositoryBase(MemoryMapDataRecord) {
  getAllMemoryMapData = async (memoryMapID: number) => {
    const memoryMapData: Array<
      Pick<SavedMemoryMapDataRecord, "ID" | "CommandSetDataID" | "LL" | "HL" | "Description" | "Value"> &
        Pick<
          SavedCommandSetDataRecord,
          "Command" | "DataType" | "DefaultLowLimit" | "DefaultHighLimit" | "DefaultValue" | "Direction" | "Parameter"
        >
    > = await this.db.raw(`
      SELECT CommandSetData.ID as CommandSetDataID, MemoryMapData.ID as MemoryMapDataID, MemoryMapData.LL, MemoryMapData.HL, MemoryMapData.Description, MemoryMapData.Value, 
      CommandSetData.Command, CommandSetData.DataType, CommandSetData.DefaultLowLimit, 
      CommandSetData.DefaultValue, CommandSetData.DefaultHighLimit, CommandSetData.Direction, 
      CommandSetData.Parameter FROM MemoryMapData INNER JOIN CommandSetData ON 
      MemoryMapData.CommandSetDataID = CommandSetData.ID WHERE MemoryMapData.MemoryMapID = ${memoryMapID}
      `);

    return memoryMapData;
  };
}
