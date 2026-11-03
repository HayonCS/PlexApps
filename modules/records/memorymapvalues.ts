import { Flavor } from "helpers";
import { MemoryMapValuesRecord, RepositoryBase } from "./core";

export type MemoryMapValuesID = Flavor<number, "MemoryMapValue ID">;

export interface UnsavedMemoryMapValuesRecord {
  MemoryMapDataID: number;
  PartNumberID: number;
  PartNumberValue: string;
}

export interface SavedMemoryMapValueRecord extends UnsavedMemoryMapValuesRecord {
  ID: MemoryMapValuesID;
}

export class MemoryMapValuesRecordRepository extends RepositoryBase(MemoryMapValuesRecord) {}
