import { Flavor } from "modules/helpers";
import { MemoryMapsID } from "./memorymaps";

export type ReleasedToProductionID = Flavor<number, "ReleasedToProduction ID">;

export interface UnsavedReleasedToProductionRecord {
  MemoryMapID: MemoryMapsID;
}

export interface SavedReleasedToProductionRecord extends UnsavedReleasedToProductionRecord {
  ID: ReleasedToProductionID;
}
