import { AuthenticationSelectors } from "../slices/authentication-slice";
import { NavigationDrawerSelectors } from "../slices/navigation-drawer-slice";
import { EditorSelectors } from "../slices/editor-slice";
import { UserSettingsSelectors } from "../slices/user-settings-slice";
import { CommandSetManagerSelectors } from "../slices/commandsetmanager-slice";
import { DashboardSelectors } from "../slices/dashboard-slice";

export const Selectors = {
  Authentication: AuthenticationSelectors,
  Editor: EditorSelectors,
  UserSettings: UserSettingsSelectors,
  NavigationDrawer: NavigationDrawerSelectors,
  CommandSetManager: CommandSetManagerSelectors,
  Dashboard: DashboardSelectors,
};
