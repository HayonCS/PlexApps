import * as React from "react";

import {
  GRID_ROOT_GROUP_ID,
  GridColDef,
  GridEventListener,
  GridGroupNode,
  GridRenderCellParams,
  GridRow,
  gridRowNodeSelector,
  GridRowProps,
  gridStringOrNumberComparator,
} from "@mui/x-data-grid-premium";
import { GridApiPremium } from "@mui/x-data-grid-premium/models/gridApiPremium";
import { Actions } from "modules/client/redux/actions";
import { store } from "modules/client/redux/store";
import { NavigateFunction } from "react-router";
import { WorkingCopyMemoryMapPartNumberCell } from "./WorkingCopyMemoryMapCell";
import { ProductionReleaseMemoryMapCell } from "./ProductionReleaseMemoryMapCell";

export const openMemoryMapInNewTab = (row: {
  PartNumber?: string;
  BOMRevision?: string;
  InternalRevision?: number;
}) => {
  if (row.PartNumber && row.BOMRevision && row.InternalRevision) {
    window.open(`/${row.PartNumber}/${row.BOMRevision.trim()}/${row.InternalRevision}`);
    store.dispatch(Actions.DashboardActions.setCurrentLibraryFilters([]));
  }
};

export const makeHandleRowClick =
  (navigate: NavigateFunction): GridEventListener<"rowClick"> =>
  (params, event, details) => {
    if (params.row.PartNumber && params.row.BOMRevision && params.row.InternalRevision) {
      navigate(`/${params.row.PartNumber}/${params.row.BOMRevision.trim()}/${params.row.InternalRevision}`);
      store.dispatch(Actions.DashboardActions.setCurrentLibraryFilters([]));
    } else {
      const api = details.api as GridApiPremium;
      const apiRefLike = { current: api };
      const rootNode = gridRowNodeSelector(apiRefLike, GRID_ROOT_GROUP_ID) as GridGroupNode;
      const groups = rootNode?.children;
      if (groups && groups.length > 1) {
        const node = gridRowNodeSelector(apiRefLike, params.id) as GridGroupNode;
        api.setRowChildrenExpansion(params.id, !node.childrenExpanded);
      }
    }
  };

export const CustomGridRow = (props: GridRowProps, apiRef: React.MutableRefObject<GridApiPremium | null>) => {
  const handleAuxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault();
      const row = apiRef.current?.getRow(props.rowId);
      if (row) {
        openMemoryMapInNewTab(row);
      }
    }
  };
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  };
  return <GridRow {...props} data-testid={props.rowId} onAuxClick={handleAuxClick} onMouseDown={handleMouseDown} />;
};

export const MemoryMapLibraryColumnDefinitions: GridColDef[] = [
  {
    field: "PartNumber",
    headerName: "MEMORY MAP",
    editable: false,
    headerAlign: "center",
    flex: 1,
    align: "center",
    hideable: false,
    disableColumnMenu: true,
    headerClassName: "columnHeader",
    sortable: true,
    sortComparator: (a, b, aParams, bParams) => {
      return gridStringOrNumberComparator(a, b, aParams, bParams);
    },
    renderCell: (params: GridRenderCellParams) => {
      const isWorkingCopy = params.row.IsWorkingCopy;
      const isProdRelease = !isWorkingCopy && params.row.InternalRevision === 1;

      return isWorkingCopy ? (
        <WorkingCopyMemoryMapPartNumberCell value={params.value} />
      ) : isProdRelease ? (
        <ProductionReleaseMemoryMapCell value={params.value} />
      ) : (
        <div>{params.value}</div>
      );
    },
  },
  {
    field: "BOMRevision",
    headerName: "BOM REVISION",
    editable: false,
    headerAlign: "center",
    flex: 0.5,
    align: "center",
    hideable: false,
    disableColumnMenu: true,
    headerClassName: "columnHeader",
    sortable: false,
  },
  {
    field: "InternalRevision",
    headerName: "VERSION",
    editable: false,
    headerAlign: "center",
    align: "center",
    flex: 0.3,
    hideable: false,
    disableColumnMenu: true,
    headerClassName: "columnHeader",
    sortable: false,
    renderCell: (params) => {
      return <div>{params.value === 1 ? "1^" : params.value}</div>;
    },
  },
  {
    field: "Description",
    headerName: "DESCRIPTION",
    editable: false,
    flex: 2,
    headerAlign: "center",
    align: "center",
    hideable: false,
    disableColumnMenu: true,
    headerClassName: "columnHeader",
    sortable: false,
  },
  {
    field: "IsWorkingCopy",
    headerName: "WORKING COPY",
    editable: false,
    disableColumnMenu: false,
    headerClassName: "columnHeader",
    sortable: false,
    hideable: true,
  },
];
