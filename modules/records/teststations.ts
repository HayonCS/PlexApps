import { Flavor } from "modules/helpers";
import { TestersID } from "./testers";
import { RepositoryBase, TestStationsRecord } from "./core";

export type TestStationsID = Flavor<number, "TestStation ID">;

export interface UnsavedTestStationsRecord {
  TesterID: TestersID;
  StationName: string;
  Description: string;
}

export interface SavedTestStationsRecord extends UnsavedTestStationsRecord {
  ID: TestStationsID;
}

export class TestStationsRecordRepository extends RepositoryBase(TestStationsRecord) {
  getTestStationsForTester = async (testerID: number): Promise<Array<SavedTestStationsRecord>> => {
    const testStations: Array<SavedTestStationsRecord> = await this.db("TestStations")
      .select("*")
      .where("TestStations.TesterID", "=", testerID);

    return testStations;
  };

  createTestStation = async (
    testerID: TestersID,
    stationName: string,
    description: string
  ): Promise<SavedTestStationsRecord> => {
    const newTestStation: UnsavedTestStationsRecord = {
      TesterID: testerID,
      StationName: stationName,
      Description: description,
    };

    return await this.insert(newTestStation);
  };
}
