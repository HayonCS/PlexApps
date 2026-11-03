import * as React from "react";
import { Button, List, ListSubheader, Modal, styled } from "@mui/material";
import { Selectors } from "modules/client/redux/selectors";
import { useDispatch, useSelector } from "react-redux";
import SettingsIcon from "@mui/icons-material/Settings";
import { UserSetting, UserSettings } from "modules/core/schemas/user-settings.gen";
import { Actions } from "modules/client/redux/actions";
import { useNavigate } from "react-router";
import { DefaultUserSettings } from "./UserSettingsDefinitions";
import { CheckboxSettingDisplay } from "./settings-components/CheckboxSettingDisplay";
import { SelectSettingDisplay } from "./settings-components/SelectSettingDisplay";
import { SliderSettingDisplay } from "./settings-components/SliderSettingDisplay";
import { SwitchSettingDisplay } from "./settings-components/SwitchSettingDisplay";
import { TextFieldSettingDisplay } from "./settings-components/TextFieldSettingDisplay";
import { useSaveUserSettingsMutation } from "modules/client/graphql/types.gen";
import { useNotifications } from "@toolpad/core";
import isEqual from "lodash/isEqual";
import { ButtonSettingDisplay } from "./settings-components/ButtonSettingDisplay";

const StyledSettingsPage = styled(Modal)(({ theme }) => ({
  ".listSubheader": {
    fontSize: theme.typography.h1.fontSize,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    color: theme.vars.palette.text.primary,
  },
}));

export const StyledSettingsList = styled(List)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.vars.palette.background.paper,
  minWidth: "30%",
  minHeight: "50%",
  borderRadius: theme.shape.borderRadius,
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "30px",
  ".bottomButtons": {
    display: "flex",
    gap: "20px",
    width: "100%",
    marginTop: "auto",
  },
}));

export const Settings: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const currentUserName = useSelector(Selectors.Authentication.currentUserName);
  const userSettings = useSelector(Selectors.UserSettings.userSettings);
  const userSettingsOpen = useSelector(Selectors.UserSettings.userSettingsOpen);
  const [newSettings, setNewSettings] = React.useState<UserSettings>(userSettings);

  const [saveUserSettings, { data, loading, error }] = useSaveUserSettingsMutation({
    variables: {
      userName: currentUserName,
      userSettings: newSettings,
    },
  });

  const ChangeSetting = (settingKey: string, setting: UserSetting): void => {
    setNewSettings({
      ...newSettings,
      [settingKey]: setting,
    });
  };

  const SaveSettings = (): void => {
    dispatch(Actions.UserSettingsActions.settingsChanged(newSettings));
    void saveUserSettings();
  };

  const HandleClose = React.useCallback(() => {
    dispatch(Actions.UserSettingsActions.showUserSettings(false));
    setNewSettings(userSettings);
  }, [dispatch, userSettings]);

  React.useEffect(() => {
    if (!loading && !error) {
      if (data) {
        if (data.saveUserSettings) {
          notifications.show("User Settings Saved Successfully.", { autoHideDuration: 4000, severity: "success" });
          dispatch(Actions.UserSettingsActions.showUserSettings(false));
        } else {
          notifications.show("Error Saving User Settings!", { autoHideDuration: 4000, severity: "error" });
        }
      }
    }
  }, [data, dispatch, error, loading, navigate, notifications]);

  const ResetToDefaults = (): void => {
    setNewSettings(DefaultUserSettings);
  };

  return (
    <StyledSettingsPage data-testid={"user-settings-page"} open={userSettingsOpen} onClose={HandleClose}>
      <StyledSettingsList
        data-testid={"user-settings-list"}
        subheader={
          <ListSubheader component="div" className={"listSubheader"}>
            <SettingsIcon fontSize="inherit" />
            Settings
          </ListSubheader>
        }
      >
        {Object.keys(newSettings).map((settingKey) => {
          const setting = newSettings[settingKey];
          switch (setting.settingType) {
            case "CheckboxType":
              return (
                <CheckboxSettingDisplay
                  key={settingKey}
                  settingKey={settingKey}
                  setting={setting}
                  onSettingChanged={ChangeSetting}
                />
              );
            case "SelectType":
              return (
                <SelectSettingDisplay
                  key={settingKey}
                  settingKey={settingKey}
                  setting={setting}
                  onSettingChanged={ChangeSetting}
                />
              );
            case "SliderType":
              return (
                <SliderSettingDisplay
                  key={settingKey}
                  settingKey={settingKey}
                  setting={setting}
                  onSettingChanged={ChangeSetting}
                />
              );
            case "SwitchType":
              return (
                <SwitchSettingDisplay
                  key={settingKey}
                  settingKey={settingKey}
                  setting={setting}
                  onSettingChanged={ChangeSetting}
                />
              );
            case "TextFieldType":
              return (
                <TextFieldSettingDisplay
                  key={settingKey}
                  settingKey={settingKey}
                  setting={setting}
                  onSettingChanged={ChangeSetting}
                />
              );
            case "ButtonType":
              return (
                <ButtonSettingDisplay
                  key={settingKey}
                  settingKey={settingKey}
                  setting={setting}
                  onSettingChanged={ChangeSetting}
                />
              );
          }
        })}
        <div className={"bottomButtons"}>
          <Button
            className={"button"}
            data-testid={"defaults-button"}
            style={{ marginLeft: "auto" }}
            variant={"contained"}
            disabled={isEqual(newSettings, DefaultUserSettings)}
            onClick={ResetToDefaults}
          >
            DEFAULTS
          </Button>
          <Button
            className={"button"}
            data-testid={"save-button"}
            variant={"contained"}
            disabled={isEqual(userSettings, newSettings)}
            onClick={SaveSettings}
          >
            SAVE
          </Button>
        </div>
      </StyledSettingsList>
    </StyledSettingsPage>
  );
};
