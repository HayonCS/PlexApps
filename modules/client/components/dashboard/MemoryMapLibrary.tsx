import * as React from "react";
import { useGridApiRef, gridFilterModelSelector, gridStringOrNumberComparator } from "@mui/x-data-grid-premium";
import { useGetAllMemoryMaps } from "modules/client/hooks/useGetAllMemoryMaps";
import { SxProps, Theme } from "@mui/system";
import { StyledDataGridSkeleton, StyledMemoryMapLibraryDataGrid } from "../editor/StyledDataGrid";
import { MemoryMapLibraryToolbar } from "./MemoryMapLibraryToolbar";
import { useDispatch, useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { Actions } from "modules/client/redux/actions";
import { useNavigate } from "react-router";
import { CustomGridRow, makeHandleRowClick, MemoryMapLibraryColumnDefinitions } from "./MemoryMapLibrary.utils";

export const MemoryMapLibrary: React.FC<{ sx?: SxProps<Theme>; width?: string }> = (props) => {
  const memorymaps = useGetAllMemoryMaps();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiRef = useGridApiRef();
  const handleRowClick = React.useMemo(() => makeHandleRowClick(navigate), [navigate]);

  const currentLibraryFilters = useSelector(Selectors.Dashboard.currentLibraryFilters);

  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [currentPageSize, setCurrentPageSize] = React.useState<number>(50);

  React.useEffect(() => {
    if (apiRef.current) {
      if (currentLibraryFilters.length > 0) {
        apiRef.current.setColumnVisibility("PartNumber", true);
        apiRef.current.setColumnVisibility("BOMRevision", true);

        if (currentLibraryFilters.includes("WORKING COPY")) {
          apiRef.current.upsertFilterItem({ id: 1, field: "IsWorkingCopy", operator: "equals", value: "true" });
        } else {
          apiRef.current.deleteFilterItem({ id: 1, field: "IsWorkingCopy", operator: "equals", value: "true" });
        }

        if (currentLibraryFilters.includes("PRODUCTION RELEASE")) {
          apiRef.current.upsertFilterItem({ id: 2, field: "InternalRevision", operator: "equals", value: "1" });
        } else {
          apiRef.current.deleteFilterItem({ id: 2, field: "InternalRevision", operator: "equals", value: "1" });
        }
      } else {
        apiRef.current.setFilterModel(
          {
            items: [],
          },
          "deleteFilterItem"
        );

        apiRef.current.setColumnVisibility("PartNumber", false);
        apiRef.current.setColumnVisibility("BOMRevision", false);
      }
    }
  }, [apiRef, currentLibraryFilters]);

  return memorymaps !== "ERROR" && memorymaps !== "LOADING" && memorymaps.length > 0 ? (
    <StyledMemoryMapLibraryDataGrid
      width={props.width ?? undefined}
      apiRef={apiRef}
      slotProps={{
        main: { "data-testid": "memory-map-library" },
      }}
      disableMultipleRowSelection={true}
      rows={memorymaps}
      columns={MemoryMapLibraryColumnDefinitions}
      rowSelection={false}
      cellSelection={false}
      disablePivoting={true}
      filterDebounceMs={100}
      rowHeight={35}
      onPreferencePanelClose={() => {
        const filterModel = gridFilterModelSelector(apiRef);
        if (apiRef.current) {
          if (apiRef.current.getFilterState(filterModel).filterModel.items.length <= 0) {
            dispatch(Actions.DashboardActions.setCurrentLibraryFilters([]));
          } else {
            dispatch(Actions.DashboardActions.setCurrentLibraryFilters(["CUSTOM"]));
          }
        }
      }}
      onPreferencePanelOpen={() => {
        dispatch(Actions.DashboardActions.setCurrentLibraryFilters(["CUSTOM"]));
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            PartNumber: currentLibraryFilters.length > 0,
            BOMRevision: currentLibraryFilters.length > 0,
            IsWorkingCopy: false,
          },
        },
        sorting: {
          sortModel: [{ field: "MemoryMap", sort: "desc" }],
        },
      }}
      showToolbar={true}
      onRowClick={handleRowClick}
      pagination={true}
      paginationMode="client"
      rowGroupingModel={["PartNumber", "BOMRevision"]}
      rowGroupingColumnMode="multiple"
      getRowId={(row) => `${row.PartNumber},${row.BOMRevision},${row.InternalRevision}`}
      paginationModel={{ page: currentPage, pageSize: currentPageSize }}
      onPaginationModelChange={(model) => {
        setCurrentPage(model.page);
        setCurrentPageSize(model.pageSize);
      }}
      slots={{
        row: (props) => {
          return CustomGridRow(props, apiRef);
        },
        toolbar: MemoryMapLibraryToolbar,
        columnFilteredIcon: undefined,
        columnHeaderFilterIconButton: undefined,
      }}
      disableColumnFilter={true}
      headerFilters={false}
      headerFilterHeight={0}
      disableColumnSelector={true}
      disableRowGrouping={currentLibraryFilters.length > 0}
      disableDensitySelector={true}
      groupingColDef={(params) => {
        if (params.fields.includes("PartNumber")) {
          return {
            headerAlign: "center",
            leafField: "PartNumber",
            align: "center",
            flex: 0.7,
            hideable: false,
            disableColumnMenu: true,
            filterable: false,
            sortable: true,
            sortComparator: (a, b, aParams, bParams) => {
              return gridStringOrNumberComparator(a, b, aParams, bParams);
            },
          };
        } else if (params.fields.includes("BOMRevision")) {
          return {
            headerAlign: "center",
            leafField: "BOMRevision",
            align: "center",
            flex: 0.3,
            hideable: false,
            disableColumnMenu: true,
            filterable: false,
            sortable: true,
          };
        }
      }}
    />
  ) : (
    <div
      data-testid={"memorymap-library-skeletons"}
      style={{ display: "flex", gap: "10px", flexDirection: "column", width: "80%", flexGrow: 1 }}
    >
      <StyledDataGridSkeleton variant={"rectangular"} style={{ height: "80px" }} />
      {Array.from({ length: 10 }, (_, i) => i).map((el) => (
        <StyledDataGridSkeleton key={el} variant={"rectangular"} style={{ height: "30px" }} />
      ))}
    </div>
  );
};
