import { Flavor } from "helpers";
import { OperationsRecord, RepositoryBase } from "./core";

export type OperationsID = Flavor<number, "Operation ID">;

export interface UnsavedOperationsRecord {
  Operation: string;
}

export interface SavedOperationRecord extends UnsavedOperationsRecord {
  ID: OperationsID;
}

export class OperationsRecordRepository extends RepositoryBase(OperationsRecord) {}
