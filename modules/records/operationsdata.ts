import { Flavor } from "helpers";
import { OperationsID, UnsavedOperationsRecord } from "./operations";
import { MemoryMapDataID } from "./memorymapdata";
import { TestStationsID, UnsavedTestStationsRecord } from "./teststations";
import { OperationsDataRecord, RepositoryBase } from "./core";
import { UnsavedCommandSetDataRecord } from "./commandsetdata";

export type OperationsDataID = Flavor<number, "OperationsData ID">;

export interface UnsavedOperationsDataRecord {
  MemoryMapDataID: MemoryMapDataID;
  TestStationID: TestStationsID;
  OperationID: OperationsID;
}

export interface SavedOperationsDataRecord extends UnsavedOperationsDataRecord {
  ID: OperationsDataID;
}

export class OperationsDataRecordRepository extends RepositoryBase(OperationsDataRecord) {
  getOperationsForCommand = async (memoryMapDataID: number) => {
    const operationsForCommand: Array<
      SavedOperationsDataRecord &
        Pick<UnsavedCommandSetDataRecord, "Command"> &
        Pick<UnsavedTestStationsRecord, "StationName"> &
        Pick<UnsavedOperationsRecord, "Operation">
    > = await this.db.raw(`
      SELECT MemoryMapDataID
      , CommandSetData.Command
      , TestStations.StationName
	    , Operations.Operation
      FROM OperationsData
      JOIN MemoryMapData ON OperationsData.MemoryMapDataID = MemoryMapData.ID 
      JOIN Operations ON Operations.ID = OperationsData.OperationID 
      JOIN TestStations ON OperationsData.TestStationID = TestStations.ID 
      JOIN CommandSetData ON CommandSetData.ID = MemoryMapData.CommandSetDataID
      WHERE MemoryMapDataID = ${memoryMapDataID}
      `);
    return operationsForCommand;
  };

  getMemoryMapOperationsData = async (memoryMapName: string, bomRevision: string, version: number) => {
    const memoryMapOperations: Array<{
      stationName: string;
      operationName: string;
      commandName: string;
      testerName: string;
    }> = await this.db.raw(`
        SELECT DISTINCT
        TestStations.StationName as stationName,
        Operations.Operation as operationName,
        CommandSetData.Command as commandName,
        Testers.TesterName as testerName
        FROM OperationsData JOIN MemoryMapData ON OperationsData.MemoryMapDataID = MemoryMapData.ID
        JOIN MemoryMaps ON MemoryMapData.MemoryMapID = MemoryMaps.ID
        JOIN CommandSetData ON MemoryMapData.CommandSetDataID = CommandSetData.ID
        JOIN TestStations ON OperationsData.TestStationID = TestStations.ID
        JOIN Operations ON OperationID = Operations.ID
        JOIN Testers ON TestStations.TesterID = Testers.ID
        WHERE MemoryMaps.PartNumber = '${memoryMapName}'
        AND MemoryMaps.BOMRevision = '${bomRevision}'
        AND MemoryMaps.InternalRevision = ${version}
        `);
    return memoryMapOperations.map((op) => {
      return { ...op, testerName: op.testerName.toLowerCase(), stationName: op.stationName.toLowerCase() };
    });
  };
}
