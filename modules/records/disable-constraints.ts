import { RepositoryBase } from "modules/records/core";
import { recordInfo } from "atomic-object/records/knex";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnsavedContextInfo {}

export type SavedContextInfo = UnsavedContextInfo;

export const ContextInfo = recordInfo<UnsavedContextInfo, SavedContextInfo, never>("", []);

export class ContextInfoRepository extends RepositoryBase(ContextInfo) {
  disableConstraints = async () => {
    return this.db.raw("SET Context_Info 0x55555");
  };

  enableConstraints = async () => {
    return this.db.raw("SET Context_Info 0x0");
  };
}
