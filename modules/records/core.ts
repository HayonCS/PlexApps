import { SavedMemoryMapsRecord, UnsavedMemoryMapsRecord } from "modules/records/memorymaps";
import { recordInfo } from "atomic-object/records/knex";
import { KnexRecordInfo, UnboundRepositoryBase } from "atomic-object/records/knex";
import { SavedAuthorsRecord, UnsavedAuthorsRecord } from "./authors";
import { SavedCommandSetDataRecord, UnsavedCommandSetDataRecord } from "./commandsetdata";
import { SavedCommandSetRecord, UnsavedCommandSetsRecord } from "./commandsets";
import { SavedFirmwareRecord, UnsavedFirmwareRecord } from "./firmware";
import { SavedMemoryMapDataRecord, UnsavedMemoryMapDataRecord } from "./memorymapdata";
import { SavedMemoryMapValueRecord, UnsavedMemoryMapValuesRecord } from "./memorymapvalues";
import { SavedOperationRecord, UnsavedOperationsRecord } from "./operations";
import { SavedOperationsDataRecord, UnsavedOperationsDataRecord } from "./operationsdata";
import { SavedReleasedToProductionRecord, UnsavedReleasedToProductionRecord } from "./releasedtoproduction";
import { SavedTestersRecord, UnsavedTestersRecord } from "./testers";
import { SavedTestStationsRecord, UnsavedTestStationsRecord } from "./teststations";
import { SavedReleasedMemoryMapsRecord, UnsavedReleasedMemoryMapsRecord } from "./releasedmemorymaps";
import { SavedUserRecord, UnsavedUserRecord } from "./user";
import { SavedPartNumbersRecord, UnsavedPartNumbersRecord } from "./partnumbers";

export function RepositoryBase<Rec extends KnexRecordInfo>(recordType: Rec) {
  return UnboundRepositoryBase<Rec>(recordType);
}

export const AuthorRecord = recordInfo<UnsavedAuthorsRecord, SavedAuthorsRecord, "ID">("Authors", ["ID"]);

export const CommandSetDataRecord = recordInfo<UnsavedCommandSetDataRecord, SavedCommandSetDataRecord, "ID">(
  "CommandSetData",
  ["ID"]
);

export const CommandSetsRecord = recordInfo<UnsavedCommandSetsRecord, SavedCommandSetRecord, "ID">("CommandSets", [
  "ID",
]);

export const FirmwareRecord = recordInfo<UnsavedFirmwareRecord, SavedFirmwareRecord, "ID">("Firmware", ["ID"]);

export const MemoryMapDataRecord = recordInfo<UnsavedMemoryMapDataRecord, SavedMemoryMapDataRecord, "ID">(
  "MemoryMapData",
  ["ID"]
);

export const MemoryMapsRecord = recordInfo<UnsavedMemoryMapsRecord, SavedMemoryMapsRecord, "ID">("MemoryMaps", ["ID"]);

export const MemoryMapValuesRecord = recordInfo<UnsavedMemoryMapValuesRecord, SavedMemoryMapValueRecord, "ID">(
  "MemoryMapValues",
  ["ID"]
);

export const OperationsRecord = recordInfo<UnsavedOperationsRecord, SavedOperationRecord, "ID">("Operations", ["ID"]);

export const OperationsDataRecord = recordInfo<UnsavedOperationsDataRecord, SavedOperationsDataRecord, "ID">(
  "OperationsData",
  ["ID"]
);

export const PartNumbersRecord = recordInfo<UnsavedPartNumbersRecord, SavedPartNumbersRecord, "ID">("PartNumbers", [
  "ID",
]);

export const ReleasedMemoryMapsRecord = recordInfo<
  UnsavedReleasedMemoryMapsRecord,
  SavedReleasedMemoryMapsRecord,
  "ID"
>("ReleasedMemoryMaps", ["ID"]);

export const ReleasedToProductionRecord = recordInfo<
  UnsavedReleasedToProductionRecord,
  SavedReleasedToProductionRecord,
  "ID"
>("ReleasedToProduction", ["ID"]);

export const TestersRecord = recordInfo<UnsavedTestersRecord, SavedTestersRecord, "ID">("Testers", ["ID"]);

export const TestStationsRecord = recordInfo<UnsavedTestStationsRecord, SavedTestStationsRecord, "ID">("TestStations", [
  "ID",
]);
export const UserRecord = recordInfo<UnsavedUserRecord, SavedUserRecord, "UserID">("Users", ["UserID"]);
