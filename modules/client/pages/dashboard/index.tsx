import * as React from "react";
import { MemoryMapLibrary } from "modules/client/components/dashboard/MemoryMapLibrary";
import { RecentMemoryMaps } from "modules/client/components/dashboard/RecentMemoryMaps";
import { NavigationSideDrawerClosedWidth } from "modules/client/styles/app-theme";
import { styled } from "@mui/material";

const StyledApp = styled("div")(() => ({
  display: "flex",
  gap: "2%",
  flexDirection: "column",
  height: "calc(100vh - 105px)",
  alignItems: "center",
  marginTop: "40px",
  paddingBottom: "50px",
  marginLeft: NavigationSideDrawerClosedWidth,
}));

export const Dashboard: React.FC<{}> = () => {
  return (
    <StyledApp>
      <RecentMemoryMaps />
      <MemoryMapLibrary width="80%" />
    </StyledApp>
  );
};
