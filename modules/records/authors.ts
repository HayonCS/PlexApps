import { Flavor } from "helpers";
import { AuthorRecord, RepositoryBase } from "./core";

export type AuthorID = Flavor<number, "Author ID">;

export interface UnsavedAuthorsRecord {
  UserName: string;
  EMail: string;
  PhoneExtension: string;
  Title: string;
  Supervisor: string;
}

export interface SavedAuthorsRecord extends UnsavedAuthorsRecord {
  ID: AuthorID;
}

export class AuthorRecordRepository extends RepositoryBase(AuthorRecord) {}
