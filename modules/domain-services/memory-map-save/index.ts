import * as Hexagonal from "atomic-object/hexagonal";
import { MemoryMapSaveAuthorizationPort } from "modules/context/ports";
import { RepositoriesPort } from "modules/records";
import { saveMemoryMap, SaveMemoryMapRequest } from "./service";
import { MemoryMapSaveDocument } from "./document";

export const MemoryMapSavePort = Hexagonal.port<
  { saveMemoryMap: (request: SaveMemoryMapRequest) => Promise<MemoryMapSaveDocument> },
  "MemoryMapSave"
>("MemoryMapSave");

export const memoryMapSaveAdapter = Hexagonal.adapter({
  port: MemoryMapSavePort,
  requires: [RepositoriesPort, MemoryMapSaveAuthorizationPort],
  build: (ctx) => ({
    saveMemoryMap: (request: SaveMemoryMapRequest) =>
      saveMemoryMap(ctx.get(RepositoriesPort), ctx.get(MemoryMapSaveAuthorizationPort), request),
  }),
});
