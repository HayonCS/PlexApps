import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { UndoxTypes } from "../undox";
import { State } from "../store";
import { AuthenticationActions } from "../slices/authentication-slice";
import { EditorActions } from "../slices/editor-slice";
import { UserSettingsActions } from "../slices/user-settings-slice";
import { NavigationDrawerActions } from "../slices/navigation-drawer-slice";
import { CommandSetManagerActions } from "../slices/commandsetmanager-slice";
import { DashboardActions } from "../slices/dashboard-slice";

export const Actions = {
  AuthenticationActions,
  EditorActions,
  UserSettingsActions,
  NavigationDrawerActions,
  CommandSetManagerActions,
  DashboardActions,
};

type UndoxActions = { type: UndoxTypes.UNDO } | { type: UndoxTypes.REDO };

export type ActionsType = UndoxActions | typeof Actions;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, null | undefined, Action<string>>;
