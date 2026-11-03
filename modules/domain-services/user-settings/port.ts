import * as Hexagonal from "atomic-object/hexagonal";
import { UserSettingsDef } from ".";

export const UserSettingsPort = Hexagonal.port<UserSettingsDef, "UserSettings">("UserSettings");
export type UserSettingsPortType = typeof UserSettingsPort;
