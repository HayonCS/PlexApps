import * as Hexagonal from "atomic-object/hexagonal";
import { RepositoriesBase } from "atomic-object/records/knex";
import { ContextInfoRepository } from "modules/records/disable-constraints";
import { MemoryMapsRecordRepository } from "./memorymaps";
import { UserRecordRepository } from "modules/records/user";
import { MemoryMapDataRecordRepository } from "./memorymapdata";
import { CommandSetDataRecordRepository } from "./commandsetdata";
import { OperationsDataRecordRepository } from "./operationsdata";
import { PartNumbersRecordRepository } from "./partnumbers";
import { CommandSetsRecordRepository } from "./commandsets";
import { OperationsRecordRepository } from "./operations";
import { MemoryMapValuesRecordRepository } from "./memorymapvalues";
import { TestersRecordRepository } from "./testers";
import { TestStationsRecordRepository } from "./teststations";
import { ReleasedMemoryMapsRecordRepository } from "./releasedmemorymaps";
import { AuthorRecordRepository } from "./authors";

export const repositoriesAdapter = (ctx: Hexagonal.Context) => {
  return new Repositories(ctx);
};
export const RepositoriesPort = Hexagonal.port<Repositories, "repos">("repos");
export class Repositories extends RepositoriesBase {
  authors = new AuthorRecordRepository(this.ctx);
  commandSets = new CommandSetsRecordRepository(this.ctx);
  commandSetData = new CommandSetDataRecordRepository(this.ctx);
  contextInfo = new ContextInfoRepository(this.ctx);
  memoryMaps = new MemoryMapsRecordRepository(this.ctx);
  memoryMapData = new MemoryMapDataRecordRepository(this.ctx);
  memoryMapValues = new MemoryMapValuesRecordRepository(this.ctx);
  operations = new OperationsRecordRepository(this.ctx);
  operationsData = new OperationsDataRecordRepository(this.ctx);
  partNumbers = new PartNumbersRecordRepository(this.ctx);
  releasedMemoryMaps = new ReleasedMemoryMapsRecordRepository(this.ctx);
  testers = new TestersRecordRepository(this.ctx);
  testStations = new TestStationsRecordRepository(this.ctx);
  users = new UserRecordRepository(this.ctx);
}
