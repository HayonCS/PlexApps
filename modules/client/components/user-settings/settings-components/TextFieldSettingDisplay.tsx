import { TextFieldSetting, UserSetting } from "modules/core/schemas/user-settings.gen";
import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { StyledSetting } from "./settings-common";
import { ListItemIcon, ListItemText, TextField, Tooltip } from "@mui/material";

export const TextFieldSettingDisplay: React.FC<{
  settingKey: string;
  setting: TextFieldSetting;
  onSettingChanged?: (settingKey: string, setting: UserSetting) => void;
}> = (props) => {
  const [value, setValue] = React.useState(props.setting.value);

  const HandleTextFieldChange = useDebouncedCallback(() => {
    props.onSettingChanged && props.onSettingChanged(props.settingKey, { ...props.setting, value: value });
  }, 300);

  return (
    <Tooltip title={props.setting.tooltip}>
      <StyledSetting data-testid={"textfield-setting"}>
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
        <TextField
          data-testid={"setting-value"}
          variant="standard"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            HandleTextFieldChange();
          }}
        />
      </StyledSetting>
    </Tooltip>
  );
};
