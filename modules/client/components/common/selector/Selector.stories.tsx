import * as React from "react";
import { mockProvider } from "modules/client/test-helpers/mock-provider";
import {} from "modules/client/test-helpers/mocks/active-directory-mocks";
import { Selector, SelectorOption } from "./Selector";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { OperationType } from "modules/core/types";
import VerifiedIcon from "@mui/icons-material/Verified";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import EditIcon from "@mui/icons-material/Edit";
import { GentexBlue } from "modules/client/styles/app-theme";

const StorybookProvider = mockProvider({
  logMissingMocks: true,
});

export default {
  component: Selector,
  title: "Common/Selector",
  tags: ["autodocs"],

  decorators: [
    (Story: any) => {
      return (
        <StorybookProvider>
          <div style={{ width: "200px" }}>
            <Story />
          </div>
        </StorybookProvider>
      );
    },
  ],
};

export const Default = {
  render: () => {
    return (
      <Selector value={"OP_CALIBRATE"}>
        <SelectorOption
          value={OperationType.OP_CALIBRATE}
          displayValue="OP_CALIBRATE"
          startAdornment={<SettingsSuggestIcon style={{ color: "orange" }} />}
        />
        <SelectorOption
          value={OperationType.OP_VERIFY}
          displayValue="OP_VERIFY"
          startAdornment={<TaskAltIcon style={{ color: "green" }} />}
        />
        <SelectorOption
          value={OperationType.OP_DEF_CHK}
          displayValue="OP_DEF_CHK"
          startAdornment={<VerifiedIcon style={{ color: "yellow" }} />}
        />
        <SelectorOption
          value={OperationType.OP_LIMIT}
          displayValue="OP_LIMIT"
          startAdornment={<SsidChartIcon style={{ color: "orangered" }} />}
        />
        <SelectorOption
          value={OperationType.OP_WRITE}
          displayValue="OP_WRITE"
          startAdornment={<EditIcon style={{ color: `${GentexBlue}` }} />}
        />
        <SelectorOption
          value={OperationType.OP_NOT_SET}
          displayValue="OP_NOT_SET"
          startAdornment={<ErrorOutlineIcon style={{ color: "red" }} />}
        />
      </Selector>
    );
  },
};
