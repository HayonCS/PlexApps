import { SliderSetting, UserSetting } from "modules/core/schemas/user-settings.gen";
import * as React from "react";
import { StyledSetting } from "./settings-common";
import { ListItemIcon, ListItemText, Slider, Tooltip } from "@mui/material";

export const SliderSettingDisplay: React.FC<{
  settingKey: string;
  setting: SliderSetting;
  onSettingChanged?: (settingKey: string, setting: UserSetting) => void;
}> = (props) => {
  const [value, setValue] = React.useState<number>(props.setting.value);

  React.useEffect(() => {
    setValue(props.setting.value);
  }, [props.setting.value]);

  return (
    <Tooltip title={props.setting.tooltip}>
      <StyledSetting data-testid={"slider-setting"}>
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
        <Slider
          data-testid={"setting-value"}
          style={{ width: "40%" }}
          min={props.setting.min}
          max={props.setting.max}
          value={value}
          valueLabelDisplay="auto"
          onChange={(event, value) => {
            if (typeof value !== "number") {
              return;
            }
            setValue(value);
            props.onSettingChanged && props.onSettingChanged(props.settingKey, { ...props.setting, value: value });
          }}
        />
      </StyledSetting>
    </Tooltip>
  );
};
