import { Flavor } from "modules/helpers";
import { MemoryMapsID } from "./memorymaps";
import { AuthorID } from "./authors";
import { ReleasedToProductionID } from "./releasedtoproduction";
import { ReleasedMemoryMapsRecord, RepositoryBase } from "./core";
import { DatetimeIso } from "modules/core/schemas/datetime-iso.gen";
import { toIsoDateTime } from "modules/core/date-time-iso";

export type ReleasedMemoryMapsID = Flavor<number, "ReleasedMemoryMap ID">;

export interface UnsavedReleasedMemoryMapsRecord {
  MemoryMapID: MemoryMapsID;
  ECNumber: string;
  DateStamp: string;
  AuthorID: AuthorID;
  LogMsg: string;
  EffectivityDate: string;
  ReleasedToProductionID: ReleasedToProductionID;
}

export interface SavedReleasedMemoryMapsRecord extends UnsavedReleasedMemoryMapsRecord {
  ID: ReleasedMemoryMapsID;
}

export class ReleasedMemoryMapsRecordRepository extends RepositoryBase(ReleasedMemoryMapsRecord) {
  isMemoryMapReleased = async (memoryMapName: string, bomRevision: string, version: number): Promise<boolean> => {
    const releasedMatch = await this.db
      .raw(`SELECT ReleasedMemoryMaps.ID, MemoryMaps.ID, PartNumber, BOMRevision, InternalRevision, 
      ECNumber, DateStamp, AuthorID, LogMsg, EffectivityDate
      FROM ReleasedMemoryMaps 
      INNER JOIN MemoryMaps ON MemoryMaps.ID = ReleasedMemoryMaps.MemoryMapID
      WHERE ReleasedToProductionID > 0 AND MemoryMaps.PartNumber = '${memoryMapName}' AND MemoryMaps.BOMRevision = '${bomRevision}' AND MemoryMaps.InternalRevision = '${version}'`);

    if (releasedMatch && releasedMatch.length > 0) {
      if (
        releasedMatch[0].PartNumber === memoryMapName &&
        releasedMatch[0].BOMRevision === bomRevision &&
        releasedMatch[0].InternalRevision === version
      ) {
        return true;
      }
    }
    return false;
  };

  getReleasedMemoryMapInformation = async (
    memoryMapName: string,
    bomRevision: string,
    version: number
  ): Promise<{
    memoryMapName: string;
    bomRevision: string;
    version: number;
    ecNumber: string;
    logMessage: string;
    dateTimeStamp: DatetimeIso;
    effectivityDate: DatetimeIso;
  } | null> => {
    const releasedMatch = await this.db
      .raw(`SELECT ReleasedMemoryMaps.ID, MemoryMaps.ID, PartNumber, BOMRevision, InternalRevision, 
      ECNumber, DateStamp, AuthorID, LogMsg, EffectivityDate
      FROM ReleasedMemoryMaps 
      INNER JOIN MemoryMaps ON MemoryMaps.ID = ReleasedMemoryMaps.MemoryMapID
      WHERE ReleasedToProductionID > 0 AND MemoryMaps.PartNumber = '${memoryMapName}' AND MemoryMaps.BOMRevision = '${bomRevision}' AND MemoryMaps.InternalRevision = '${version}'`);

    if (releasedMatch && releasedMatch.length > 0) {
      return {
        ecNumber: releasedMatch[0].ECNumber,
        logMessage: releasedMatch[0].LogMsg,
        effectivityDate: toIsoDateTime(releasedMatch[0].EffectivityDate),
        dateTimeStamp: toIsoDateTime(releasedMatch[0].DateStamp),
        memoryMapName: memoryMapName,
        bomRevision: bomRevision,
        version: version,
      };
    } else {
      return null;
    }
  };
}
