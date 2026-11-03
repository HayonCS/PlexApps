import * as React from "react";
import { styled, Typography } from "@mui/material";

const StyledCommandSetInfoDisplay = styled("div")(({ theme }) => ({
  display: "flex",
  width: "95%",
  alignSelf: "center",
  flexDirection: "column",
  ".container": {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px",
    gap: "5px",
  },
  ".headerText": {
    position: "relative",
    width: "100%",
    color: theme.palette.primary.contrastText,
    marginLeft: "5px",
    "::after": {
      content: '" "',
      position: "absolute",
      width: "100%",
      height: "120%",
      top: "50%",
      left: 0,
      transform: "translate(-8px, -50%)",
      zIndex: -1,
      borderRadius: theme.shape.borderRadius,
      background: `linear-gradient(to right, ${theme.palette.primary.main}, transparent)`,
    },
  },
}));

export const CommandSetInfoDisplay: React.FC<{ version: number; description: string | undefined }> = (props) => {
  return (
    <StyledCommandSetInfoDisplay data-testid={"commandset-info-display"}>
      <div className={"container"}>
        <Typography className={"headerText"} data-testid={"commandset-revision-header"}>
          Revision:
        </Typography>
        <Typography className={"text"} data-testid={"commandset-revision"}>
          {props.version}
        </Typography>
      </div>
      <div className={"container"}>
        <Typography className={"headerText"} data-testid={"commandset-description-header"}>
          Description:
        </Typography>
        <Typography className={"text"} data-testid={"commandset-description"}>
          {props.description ?? "No Description"}
        </Typography>
      </div>
    </StyledCommandSetInfoDisplay>
  );
};
