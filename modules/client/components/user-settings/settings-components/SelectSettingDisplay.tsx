import * as React from "react";
import { ListItemIcon, ListItemText, MenuItem, Select, Tooltip } from "@mui/material";
import { StyledSetting } from "./settings-common";
import { SelectSetting, UserSetting } from "modules/core/schemas/user-settings.gen";

export const SelectSettingDisplay: React.FC<{
  settingKey: string;
  setting: SelectSetting;
  onSettingChanged?: (settingKey: string, setting: UserSetting) => void;
}> = (props) => {
  const [value, setValue] = React.useState(props.setting.value);
  const menuItems = props.setting.selections;

  React.useEffect(() => {
    setValue(props.setting.value);
  }, [props.setting.value]);

  return (
    <Tooltip title={props.setting.tooltip}>
      <StyledSetting data-testid={"select-setting"}>
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
        <Select
          data-testid={"setting-value"}
          variant="standard"
          value={value}
          onChange={(event) => {
            const value = event.target.value;
            setValue(value);
            props.onSettingChanged && props.onSettingChanged(props.settingKey, { ...props.setting, value: value });
          }}
        >
          {menuItems.map((item, index) => (
            <MenuItem key={index} value={item.toString()}>
              {item.toString()}
            </MenuItem>
          ))}
        </Select>
      </StyledSetting>
    </Tooltip>
  );
};
