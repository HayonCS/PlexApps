import { CheckboxSetting, UserSetting } from "modules/core/schemas/user-settings.gen";
import * as React from "react";
import { StyledSetting } from "./settings-common";
import { Checkbox, ListItemIcon, ListItemText, Tooltip } from "@mui/material";

export const CheckboxSettingDisplay: React.FC<{
  settingKey: string;
  setting: CheckboxSetting;
  onSettingChanged?: (settingKey: string, setting: UserSetting) => void;
}> = (props) => {
  const [value, setValue] = React.useState<boolean>(props.setting.value);

  React.useEffect(() => {
    setValue(props.setting.value);
  }, [props.setting.value]);

  return (
    <Tooltip title={props.setting.tooltip}>
      <StyledSetting data-testid={"checkbox-setting"}>
        <ListItemIcon className={"settingIcon"} data-testid={"setting-icon"}>
          <span className={"material-icons"}>{props.setting.iconName}</span>
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
        <Checkbox
          data-testid={"setting-value"}
          checked={value}
          onChange={(event) => {
            props.onSettingChanged &&
              props.onSettingChanged(props.settingKey, { ...props.setting, value: event.target.checked });
            setValue(event.target.checked);
          }}
        />
      </StyledSetting>
    </Tooltip>
  );
};
