import { Tooltip } from "@mui/material";
import * as React from "react";
import WorkingCopyIcon from "@mui/icons-material/EditNote";

export const WorkingCopyMemoryMapPartNumberCell: React.FC<{ value: string }> = (props) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Tooltip title={"Working Copy"}>
        <WorkingCopyIcon
          data-testid={"working-copy-icon"}
          fontSize="medium"
          style={{ transform: "translate(-15px, -1px)" }}
        />
      </Tooltip>
      <div style={{ transform: "translateX(-9px)", fontWeight: "bold" }}>{props.value}</div>
    </div>
  );
};
