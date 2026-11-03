/**
 * Describes the abstract core of a generic repository pattern.
 *
 * See ./knex/index.ts for documentation about the knex-based adapter.
 */

import * as DataLoader from "dataloader";

export interface EntityType<TUnsaved = any, TSaved = any, TIds extends object = any> {
  _saved: TSaved;
  _unsaved: TUnsaved;
  _idKeys: TIds;
  idOf: (rec: TSaved) => TIds;
}

/** Extract the static type of a saved record from a RecordInfo */
export type SavedR<T extends { _saved: any }> = T["_saved"];
/** Extract the static type of a unsaved record from a RecordInfo */
export type UnsavedR<T extends { _unsaved: any }> = T["_unsaved"];
/** Extract the static type of the id of a record from a RecordInfo*/
export type KeyType<R extends EntityType> = R["_idKeys"];

export interface IAbstractRepository<TRecordInfo extends EntityType> {
  insert(unsavedRecord: UnsavedR<TRecordInfo>): Promise<SavedR<TRecordInfo>>;
  insertMany(unsavedRecords: UnsavedR<TRecordInfo>[]): Promise<SavedR<TRecordInfo>[]>;
  update(attrs: SavedR<TRecordInfo>): Promise<SavedR<TRecordInfo>>;
  delete(...ids: KeyType<TRecordInfo>[]): Promise<void>;

  find: DataLoader<KeyType<TRecordInfo>, SavedR<TRecordInfo> | null>;
}
