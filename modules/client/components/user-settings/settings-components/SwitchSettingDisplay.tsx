import { SwitchSetting, UserSetting } from "modules/core/schemas/user-settings.gen";
import * as React from "react";
import { StyledSetting } from "./settings-common";
import { ListItemIcon, ListItemText, Switch, Tooltip } from "@mui/material";

export const SwitchSettingDisplay: React.FC<{
  settingKey: string;
  setting: SwitchSetting;
  onSettingChanged?: (settingKey: string, setting: UserSetting) => void;
}> = (props) => {
  const [value, setValue] = React.useState<boolean>(props.setting.value);

  React.useEffect(() => {
    setValue(props.setting.value);
  }, [props.setting.value]);

  return (
    <Tooltip title={props.setting.tooltip}>
      <StyledSetting data-testid={"switch-setting"}>
        <ListItemIcon className={"settingIcon"} data-testid={"setting-icon"}>
          <div className={"material-icons"}>{props.setting.iconName}</div>
        </ListItemIcon>
        <ListItemText
          data-testid={"setting-name"}
          slotProps={{
            primary: {
              className: "settingText",
            },
            secondary: {
              className: "settingTextSecondary",
            },
          }}
          secondary={props.setting.description}
        >
          {props.setting.label}
        </ListItemText>
        <Switch
          data-testid={"setting-value"}
          checked={value}
          onChange={(event) => {
            setValue(event.target.checked);
            props.onSettingChanged &&
              props.onSettingChanged(props.settingKey, { ...props.setting, value: event.target.checked });
          }}
        />
      </StyledSetting>
    </Tooltip>
  );
};
