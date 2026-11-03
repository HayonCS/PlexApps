import { Flavor } from "helpers";
import { RepositoryBase } from "modules/records/core";
import { UserRecord } from "modules/records/core";

export type UserID = Flavor<number, "User id">;

export interface UnsavedUserRecord {
  Name: string;
  Phone: string;
  EMail: string;
  Manager: string;
  Location: string;
  ReadOnly: boolean;
  EmployeeNumber: number | null;
}

export interface SavedUserRecord extends UnsavedUserRecord {
  UserID: UserID;
}

export interface SavedUserRecordAndAppKey extends SavedUserRecord {
  AppKey: string;
}

export interface UnsavedUserAccess {
  Name: string;
  Phone: string | undefined;
  EMail: string | undefined;
  Manager: string | undefined;
  Location: string | undefined;
  ReadOnly: boolean | undefined;
  EmployeeNumber: number | undefined;
}

export class UserRecordRepository extends RepositoryBase(UserRecord) {
  findByUserName = async (userName: string) => {
    const rows: Array<SavedUserRecord> = await this.db.select().from("Users").where({ Name: userName });

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  };

  findByPhone = async (phone: string) => {
    if (phone.length === 0) {
      return null;
    }

    const rows: Array<SavedUserRecord> = await this.db.select().from("Users").where({ Phone: phone });

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  };

  findByEmail = async (email: string) => {
    if (email.length === 0) {
      return null;
    }

    const rows: Array<SavedUserRecord> = await this.db.select().from("Users").where({ EMail: email });

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  };

  listAllUsers = async () => {
    const rows: Array<SavedUserRecord> = await this.db
      .select("UserID")
      .select("Name")
      .select("Phone")
      .select("EMail")
      .select("Manager")
      .select("Location")
      .select("ReadOnly")
      .select("EmployeeNumber")
      .from("Users")
      .whereNotNull("EmployeeNumber");

    return rows;
  };

  insertOrUpdate = async (user: UnsavedUserAccess) => {
    let existingUser = await this.findByUserName(user.Name);
    if (!existingUser) {
      existingUser = await this.findByEmail(user.EMail || "");
    }
    if (!existingUser) {
      existingUser = await this.findByPhone(user.Phone || "");
    }

    if (existingUser) {
      if (user.Location !== undefined) {
        existingUser.Location = user.Location;
      }
      if (user.Manager !== undefined) {
        existingUser.Manager = user.Manager;
      }
      if (user.Phone !== undefined) {
        existingUser.Phone = user.Phone;
      }
      if (user.ReadOnly !== undefined) {
        existingUser.ReadOnly = user.ReadOnly;
      }
      if (user.EmployeeNumber !== undefined) {
        existingUser.EmployeeNumber = user.EmployeeNumber;
      }
      if (user.EMail !== undefined) {
        existingUser.EMail = user.EMail;
      }

      return await this.update(existingUser);
    }

    const defaultUser = {
      Name: user.Name,
      EMail: user.EMail || `${user.Name}@gentex.com`, //db unique constraint
      Location: user.Location || "Gentex",
      Manager: user.Manager || "Unknown",
      Phone: user.Phone || `x-${user.Name}`, //db unique constraint
      ReadOnly: true,
      EmployeeNumber: user.EmployeeNumber ?? 0,
    };

    return await this.insert(defaultUser);
  };

  updateReadOnly = async (userName: string, isReadOnly: boolean) => {
    return await this.db
      .table("Users")
      .update("ReadOnly", isReadOnly ? "TRUE" : "FALSE")
      .where({ Name: userName });
  };
}
