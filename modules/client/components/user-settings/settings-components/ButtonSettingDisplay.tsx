import { ButtonSetting, UserSetting } from "modules/core/schemas/user-settings.gen";
import * as React from "react";
import { StyledSetting } from "./settings-common";
import { Button, ListItemIcon, ListItemText, Tooltip } from "@mui/material";

export const ButtonSettingDisplay: React.FC<{
  settingKey: string;
  setting: ButtonSetting;
  onSettingChanged?: (settingKey: string, setting: UserSetting) => void;
}> = (props) => {
  return (
    <Tooltip title={props.setting.tooltip}>
      <StyledSetting data-testid={"button-setting"}>
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
        <Button
          data-testid={"setting-value"}
          variant="contained"
          onClick={() => {
            var theFunction = new Function(props.setting.value);
            theFunction();
          }}
        >
          {props.setting.buttonText}
        </Button>
      </StyledSetting>
    </Tooltip>
  );
};
