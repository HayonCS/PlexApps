import { Skeleton, styled } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";

export const StyledMemoryMapLibraryDataGrid = styled(DataGridPremium)<{ width?: string }>(({ theme, width }) => ({
  display: "flex",
  backgroundColor: theme.vars.palette.background.paper,
  flexGrow: 1,
  width: width ?? "100%",
  "& .MuiDataGrid-row": {
    cursor: "pointer",
  },
  "& .MuiDataGrid-footerContainer": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h3.fontSize,
  },

  "& .MuiDataGrid-columnHeader": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h3.fontSize,
  },
  "& .MuiDataGrid-cell": {
    paddingRight: "0px",
    paddingLeft: "0px",
  },
}));

export const StyledMemoryMapEditorDataGrid = styled(DataGridPremium)<{ width?: string }>(({ theme, width }) => ({
  display: "flex",
  backgroundColor: theme.vars.palette.background.paper,
  flexGrow: 1,
  width: width ?? "100%",
  "& .MuiDataGrid-footerContainer": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h3.fontSize,
  },

  "& .MuiDataGrid-columnHeader": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h3.fontSize,
  },
  "@keyframes flash": {
    "0%, 100%": { backgroundColor: "transparent" },
    "50%": { backgroundColor: `${theme.palette.primary.main}` },
  },
  ".row-flash": {
    animation: "flash 1s 5 ease-in-out",
  },
  "& .MuiDataGrid-cell": {
    paddingRight: "0px",
    paddingLeft: "0px",
  },
  "& .invalid-cell": {
    border: "2px solid",
    borderColor: theme.palette.error.main,
    boxSizing: "border-box",
  },
  "& .MuiDataGrid-cell--editing": {
    overflow: "visible !important",
    position: "relative",
    zIndex: 10,
  },
  "& .MuiDataGrid-cell--editing .MuiDataGrid-editInputCell": {
    position: "absolute",
    top: 0,
    height: "100%",
    minWidth: "100%",
    width: "260px",
    maxWidth: "1000px",
    backgroundColor: theme.vars.palette.background.paper,
    boxShadow: theme.shadows[6],
  },
}));

export const StyledDataGridSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  width: "100%",
}));
