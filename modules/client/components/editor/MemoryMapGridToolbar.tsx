import { /*IconButton, Tooltip, keyframes,*/ styled } from "@mui/material";
import { Box } from "@mui/system";
import {
  GridCsvExportOptions,
  GridExcelExportOptions,
  Toolbar,
  // ColumnsPanelTrigger,
  // gridFilterModelSelector,
  // gridColumnVisibilityModelSelector,
  // useGridApiContext,
  // useGridSelector,
} from "@mui/x-data-grid-premium";
import * as React from "react";
import { DisplayFormatSelector } from "./DisplayFormatSelector";
import { ToolbarExportSpeedDial } from "./ToolbarExportSpeedDial";
import { GridQuickFilter } from "../common/quickfilter/GridQuickFilter";
//import ViewColumnIcon from "@mui/icons-material/ViewColumn";

// const flash = keyframes`
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.4; }
// `;

// const FilteredBadge = styled("div")(({ theme }) => ({
//   backgroundColor: theme.vars.palette.background.paper,
//   color: theme.vars.palette.warning.main,
//   fontWeight: "bold",
//   fontSize: "0.75rem",
//   letterSpacing: "0.08em",
//   marginLeft: theme.spacing(1.25),
//   padding: theme.spacing(0.375, 1.25),
//   borderRadius: theme.shape.borderRadius,
//   border: `1px solid ${theme.vars.palette.warning.main}`,
//   userSelect: "none",
//   whiteSpace: "nowrap",
//   animation: `${flash} 5s ease-in-out infinite`,
// }));

/**
 * Must be rendered inside a DataGrid context (relies on useGridApiContext).
 * Displays a "FILTERED" badge whenever any column filter or quick-filter is
 * active, or when any column is hidden.
 */
// const FilteredIndicator: React.FC = () => {
//   const apiRef = useGridApiContext();
//   const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
//   const columnVisibilityModel = useGridSelector(apiRef, gridColumnVisibilityModelSelector);

//   const hasActiveFilter =
//     (filterModel.items &&
//       filterModel.items.some(
//         (item) =>
//           item.value !== undefined &&
//           item.value !== "" &&
//           item.value !== null &&
//           !(Array.isArray(item.value) && item.value.length === 0)
//       )) ||
//     (filterModel.quickFilterValues &&
//       filterModel.quickFilterValues.some((v) => v !== "" && v !== null && v !== undefined));

//   const hasHiddenColumns = Object.values(columnVisibilityModel).some((v) => v === false);

//   if (!hasActiveFilter && !hasHiddenColumns) return null;

//   return <FilteredBadge data-testid="filtered-indicator">FILTERED</FilteredBadge>;
// };

export const StyledMemoryMapGridToolbarContainer = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderBottom: "0px",
  ".memoryMapLabelDiv": {
    alignSelf: "center",
    fontSize: theme.typography.h2.fontSize,
    backgroundColor: theme.palette.secondary.main,
    padding: "7px 10px 7px 10px",
    borderRadius: theme.shape.borderRadius,
  },
  ".quickFilter": {
    ".MuiIconButton-root": {
      color: theme.palette.primary.contrastText,
    },
  },
  ".quickFilterInput": {
    color: theme.palette.primary.contrastText,
  },
}));

export const MemoryMapGridToolbar: React.FC<{
  csvOptions?: GridCsvExportOptions;
  excelOptions?: GridExcelExportOptions;
}> = (props) => {
  return (
    <StyledMemoryMapGridToolbarContainer data-testid={"memorymap-grid-toolbar"}>
      {/* <Tooltip title="Show/Hide Columns" enterDelay={500}>
        <ColumnsPanelTrigger
          render={<IconButton data-testid="columns-panel-trigger" sx={{ color: "inherit" }} aria-label="Columns" />}
        >
          <ViewColumnIcon />
        </ColumnsPanelTrigger>
      </Tooltip> 
      <FilteredIndicator />
      */}
      <Box sx={{ flexGrow: 1 }} />
      <DisplayFormatSelector />
      <GridQuickFilter />
      <ToolbarExportSpeedDial csvOptions={props.csvOptions} excelOptions={props.excelOptions} />
    </StyledMemoryMapGridToolbarContainer>
  );
};
