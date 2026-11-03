import { Flavor } from "helpers";

export type FirmwareID = Flavor<number, "Firmware ID">;

export interface UnsavedFirmwareRecord {
  PartNumber: string;
  BOMRevision: string;
  Description: string;
  FilePath: string;
}

export interface SavedFirmwareRecord extends UnsavedFirmwareRecord {
  ID: FirmwareID;
}
