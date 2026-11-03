import * as React from "react";
import { Toolbar } from "@mui/x-data-grid-premium";
import { styled } from "@mui/material/styles";
import { ToolbarExportSpeedDial } from "../editor/ToolbarExportSpeedDial";
import { Box } from "@mui/system";
import { GridQuickFilter } from "../common/quickfilter/GridQuickFilter";
import { FilterButtonGroup } from "./FilterButtonGroup";

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.vars.palette.primary.main,
  borderBottom: "0px",
  ".filterButtonGroup": {
    marginLeft: "15px",
  },
}));

export const MemoryMapLibraryToolbar: React.FC<{}> = (props) => {
  return (
    <StyledToolbar {...props} data-testid={"memorymap-library-toolbar"}>
      <FilterButtonGroup className={"filterButtonGroup"} />
      <Box sx={{ flexGrow: 1 }} />
      <GridQuickFilter />
      <ToolbarExportSpeedDial />
    </StyledToolbar>
  );
};
