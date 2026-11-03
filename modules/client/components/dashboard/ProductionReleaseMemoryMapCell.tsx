import { Tooltip } from "@mui/material";
import * as React from "react";
import ProdReleaseIcon from "@mui/icons-material/Grade";

export const ProductionReleaseMemoryMapCell: React.FC<{ value: string }> = (props) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Tooltip title={"Production Release"}>
        <ProdReleaseIcon
          data-testid={"production-release-icon"}
          fontSize="small"
          style={{ transform: "translate(-15px, -1px)" }}
        />
      </Tooltip>
      <div style={{ transform: "translateX(-9px)", fontWeight: "bold" }}>{props.value}</div>
    </div>
  );
};
