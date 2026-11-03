import { Flavor } from "modules/helpers";
import { RepositoryBase, TestersRecord } from "./core";

export type TestersID = Flavor<number, "Tester ID">;

export interface UnsavedTestersRecord {
  TesterName: string;
  Description: string;
  Image?: Buffer;
}

export interface SavedTestersRecord extends UnsavedTestersRecord {
  ID: TestersID;
}

export class TestersRecordRepository extends RepositoryBase(TestersRecord) {
  getAllTesters = async () => {
    const allTesters: Array<SavedTestersRecord> = await this.db("Testers").select("*");

    return allTesters.map((tester) => {
      return {
        id: tester.ID,
        testerName: tester.TesterName,
        description: tester.Description ?? "",
        image: tester.Image ? tester.Image.toString() : null,
      };
    });
  };

  getTesterByName = async (testerName: string): Promise<SavedTestersRecord | undefined> => {
    const tester: SavedTestersRecord | undefined = await this.db("Testers")
      .select("*")
      .where("TesterName", "=", testerName)
      .first();

    return tester;
  };

  createTester = async (testerName: string, description: string): Promise<SavedTestersRecord> => {
    const newTester: UnsavedTestersRecord = {
      TesterName: testerName,
      Description: description,
    };

    return await this.insert(newTester);
  };
}
