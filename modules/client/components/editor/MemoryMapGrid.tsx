import { Selectors } from "modules/client/redux/selectors";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMemoryMapGridColumns,
  getMemoryMapGridRows,
  DIRECTION_COLORS_RGB,
  COMMAND_DRAG_DATA_TYPE,
} from "./helper-functions";
import { StyledMemoryMapEditorDataGrid } from "./StyledDataGrid";
import {
  GridCellModes,
  GridCellModesModel,
  GridCellParams,
  GridRow,
  GridRowProps,
  GridValidRowModel,
  GridRowSelectionModel,
  useGridApiRef,
  GridCsvExportOptions,
  GridExcelExportOptions,
} from "@mui/x-data-grid-premium";
import { MemoryMapGridToolbar } from "./MemoryMapGridToolbar";
import * as _ from "lodash-es";
import { Actions } from "modules/client/redux/actions";
import { isPartNumber } from "modules/client/utilities/partnumber-util";
import { useNavigate, useParams } from "react-router";
import { flushSync } from "react-dom";
import { useEditorSave } from "./EditorSaveContext";
import { toStorageValue } from "modules/client/utilities/storage-value";

const MemoryMapGrid: React.FC<{ width?: string }> = (props) => {
  const navigate = useNavigate();
  const gridApiRef = useGridApiRef();
  const saveCoordinator = useEditorSave();
  const commitWaiters = React.useRef<Array<{ resolve: () => void; reject: (error: Error) => void }>>([]);
  const registerCommit = saveCoordinator?.registerCommit;

  React.useEffect(
    () =>
      registerCommit?.(async () => {
        const api = gridApiRef.current;
        if (!api) return;
        const edits = Object.entries(api.state.editRows).flatMap(([id, fields]) =>
          Object.keys(fields).map((field) => ({ id, field }))
        );
        if (!edits.length) return;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            commitWaiters.current = [];
            reject(new Error("The active cell could not be committed. Finish editing it and try Save again."));
          }, 3000);
          commitWaiters.current.push({
            resolve: () => {
              clearTimeout(timeout);
              resolve();
            },
            reject: (error) => {
              clearTimeout(timeout);
              reject(error);
            },
          });
          // Flush the controlled edit-mode render, then wait for processRowUpdate's dispatch.
          flushSync(() => {
            edits.forEach(({ id, field }) => {
              if (api.getCellMode(id, field) === GridCellModes.Edit) api.stopCellEditMode({ id, field });
            });
          });
        });
      }),
    [gridApiRef, registerCommit]
  );

  const memoryMapDocument = useSelector(Selectors.Editor.currentMemoryMap);
  const selectedFormat = useSelector(Selectors.Editor.displayFormat);
  const storedReadOnly = useSelector(Selectors.Editor.readOnly);
  const readOnly = storedReadOnly || Boolean(saveCoordinator?.pending);

  const dispatch = useDispatch();
  const { memoryMapName, bomRevision, version, commandName, parameterName } = useParams();

  const columns = React.useMemo(() => {
    // Keep active columns editable until MUI flushes its debounced input mutation.
    return getMemoryMapGridColumns(memoryMapDocument, storedReadOnly, selectedFormat);
  }, [memoryMapDocument, storedReadOnly, selectedFormat]);

  const rows = React.useMemo(() => {
    return getMemoryMapGridRows(selectedFormat, memoryMapDocument);
  }, [memoryMapDocument, selectedFormat]);

  const MemoryMapGridRow = React.useCallback((props: GridRowProps) => {
    return <GridRow {...props} data-testid={props.row["command"]} />;
  }, []);

  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (readOnly || !event.dataTransfer.types.includes(COMMAND_DRAG_DATA_TYPE)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    },
    [readOnly]
  );

  const handleDragLeave = React.useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      setIsDragOver(false);
      if (readOnly) {
        return;
      }
      const commandName = event.dataTransfer.getData(COMMAND_DRAG_DATA_TYPE);
      if (commandName) {
        event.preventDefault();
        dispatch(Actions.EditorActions.addCommand({ commandName }));
      }
    },
    [dispatch, readOnly]
  );

  const [cellModesModel, setCellModesModel] = React.useState<GridCellModesModel>({});

  const handleCellClick = React.useCallback(
    (params: GridCellParams, event: React.MouseEvent) => {
      if (readOnly) return;
      const commandName = params.row.command;

      if (commandName) {
        dispatch(Actions.CommandSetManagerActions.setSelectedCommand(commandName));
      }

      if (!params.isEditable) {
        return;
      }

      if ((event.target as any).nodeType === 1 && !event.currentTarget.contains(event.target as Element)) {
        return;
      }

      setCellModesModel((prevModel) => {
        return {
          ...Object.keys(prevModel).reduce(
            (acc, id) => ({
              ...acc,
              [id]: Object.keys(prevModel[id]).reduce(
                (acc2, field) => ({
                  ...acc2,
                  [field]: { mode: GridCellModes.View },
                }),
                {}
              ),
            }),
            {}
          ),
          [params.id]: {
            ...Object.keys(prevModel[params.id] || {}).reduce(
              (acc, field) => ({ ...acc, [field]: { mode: GridCellModes.View } }),
              {}
            ),
            [params.field]: { mode: GridCellModes.Edit },
          },
        };
      });
    },
    [dispatch, readOnly]
  );

  const setEditing = saveCoordinator?.setEditing;
  const handleCellModesModelChange = React.useCallback(
    (newModel: GridCellModesModel) => {
      setCellModesModel(newModel);
      setEditing?.(
        Object.values(newModel).some((fields) => Object.values(fields).some((cell) => cell.mode === GridCellModes.Edit))
      );
    },
    [setEditing]
  );
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set([]),
  });

  const [flashingCellId, setFlashingCellId] = React.useState<string | null>(null);
  const [hasFlashed, setHasFlashed] = React.useState<boolean>(false);

  React.useEffect(() => {
    const rowMatch = rows.find((rowVal) => {
      if (commandName) {
        if (parameterName) {
          return (
            rowVal.command.toLowerCase() === commandName.toLowerCase() &&
            rowVal.parameter.value.toLowerCase() === parameterName.toLowerCase()
          );
        }

        return rowVal.id.toLowerCase() === ("index0_" + commandName).toLowerCase();
      }
    });

    if (rowMatch) {
      setRowSelectionModel({ type: "include", ids: new Set([`${rowMatch.id}`]) });
      if (gridApiRef && gridApiRef.current) {
        const rowIndex = gridApiRef.current.getRowIndexRelativeToVisibleRows(rowMatch.id);
        setTimeout(() => {
          if (gridApiRef && gridApiRef.current) {
            gridApiRef.current.scrollToIndexes({ rowIndex });
          }
        }, 0);
      }

      if (!hasFlashed) {
        setFlashingCellId(rowMatch.id);
        setTimeout(() => setFlashingCellId(null), 3000); // Remove after animation
        setHasFlashed(true);
      }
    }
  }, [commandName, gridApiRef, hasFlashed, parameterName, rows]);

  const excelOptions = React.useMemo((): GridExcelExportOptions => {
    // Post-process: Apply font colors based on cell content
    const exceljsPostProcess: NonNullable<GridExcelExportOptions["exceljsPostProcess"]> = async ({ worksheet }) => {
      // Set print settings (Landscape, fit to width)
      worksheet.pageSetup.orientation = "landscape";
      worksheet.pageSetup.fitToPage = true;
      worksheet.pageSetup.fitToWidth = 1;
      worksheet.pageSetup.fitToHeight = 0; // 0 = automatic height to fit all rows

      // Header is always row 1 (no customHeader or metadata rows configured)
      const headerRow = worksheet.getRow(1);

      // Make header row bold with blue background
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF428BCA" }, // Blue background (Bootstrap blue)
        };
      });

      // Get column mapping from header row
      const columnMap: Record<string, number> = {};
      headerRow.eachCell((cell, colNumber) => {
        const headerValue = String(cell.value).toLowerCase();
        columnMap[headerValue] = colNumber;
      });

      // Convert a direction key to an ARGB hex string using the shared colour map
      const getArgbColorForDirection = (directionKey: string): string => {
        const rgb = DIRECTION_COLORS_RGB[directionKey];
        if (!rgb) return "FF000000";
        const [r, g, b] = rgb;
        return `FF${r.toString(16).padStart(2, "0").toUpperCase()}${g.toString(16).padStart(2, "0").toUpperCase()}${b.toString(16).padStart(2, "0").toUpperCase()}`;
      };

      // Iterate data rows to apply styling
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 1) return;

        let rowDirection: string | null = null;

        // PARAMETER column styling
        const parameterColIndex = columnMap["parameter"];
        if (parameterColIndex) {
          const parameterCell = row.getCell(parameterColIndex);
          const cellValue = parameterCell.value ? String(parameterCell.value) : "";

          // Check if value is JSON string from valueFormatter
          if (cellValue.startsWith("{") && cellValue.endsWith("}")) {
            try {
              const parsed = JSON.parse(cellValue);
              if (parsed && parsed.value) {
                // Set cell value to simple text
                parameterCell.value = parsed.value;

                // Store direction for use with other columns
                if (parsed.direction) {
                  rowDirection = parsed.direction.toLowerCase();
                  parameterCell.font = { color: { argb: getArgbColorForDirection(rowDirection!) } };
                }
              }
            } catch {
              // Ignore JSON parse errors
            }
          }
        }

        // Apply color to VALUE, LOW LIMIT, and HIGH LIMIT columns based on direction
        if (rowDirection !== null) {
          const argbColor = getArgbColorForDirection(rowDirection);

          ["value", "low limit", "high limit"].forEach((colName) => {
            const colIndex = columnMap[colName];
            if (colIndex) {
              const cell = row.getCell(colIndex);
              cell.font = { color: { argb: argbColor } };
            }
          });
        }
      });
    };

    const fileName = memoryMapDocument?.name ? `${memoryMapDocument.name}_MemoryMap` : "MemoryMap_Export";
    return {
      fileName,
      exceljsPostProcess,
      getRowsToExport: () => rows.map((row) => row.id),
    };
  }, [memoryMapDocument, rows]);

  const csvOptions = React.useMemo((): GridCsvExportOptions => {
    const fileName = memoryMapDocument?.name ? `${memoryMapDocument.name}_MemoryMap.csv` : "MemoryMap_Export.csv";
    return {
      fileName,
      getRowsToExport: () => rows.map((row) => row.id),
    };
  }, [memoryMapDocument, rows]);

  return (
    <div
      style={{
        position: "relative",
        width: props.width ?? "100%",
        height: "100%",
        pointerEvents: saveCoordinator?.pending ? "none" : undefined,
      }}
      onKeyDownCapture={(event) => {
        if (saveCoordinator?.pending) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <StyledMemoryMapEditorDataGrid
        apiRef={gridApiRef}
        width={props.width ?? undefined}
        autosizeOnMount={false}
        columns={columns}
        initialState={{
          columns: {
            columnVisibilityModel: {
              direction: false,
            },
          },
        }}
        slotProps={{
          main: { "data-testid": "memorymap-grid" },
          toolbar: {
            csvOptions,
            excelOptions,
          },
        }}
        disableAggregation={true}
        disableColumnSorting={true}
        cellSelection={false}
        disableColumnMenu={true}
        disableVirtualization={false}
        editMode="cell"
        rowBufferPx={500}
        rowHeight={40}
        scrollbarSize={17}
        rows={rows}
        slots={{
          row: MemoryMapGridRow,
          toolbar: MemoryMapGridToolbar,
        }}
        showToolbar={true}
        cellModesModel={cellModesModel}
        onCellModesModelChange={handleCellModesModelChange}
        onCellClick={handleCellClick}
        onCellEditStart={(_params, event) => {
          // MUI can start edits through keyboard or double-click, independently of onCellClick.
          // Do not change column editability: Save must still flush the existing edit.
          if (readOnly) event.defaultMuiPrevented = true;
        }}
        processRowUpdate={(newRow: GridValidRowModel, oldRow: GridValidRowModel) => {
          const changedProperties = Object.keys(_.pickBy(newRow, (value, key) => value !== oldRow[key]));

          if (changedProperties.length > 0) {
            const changedProperty = changedProperties[0];
            const datatype = memoryMapDocument!.commands[newRow.command].parameters[newRow.parameter.value].datatype;
            const storageValue = toStorageValue(newRow[changedProperty], selectedFormat, datatype);

            if (changedProperty === "lowLimit") {
              dispatch(
                Actions.EditorActions.modifyLowLimit({
                  commandName: newRow.command,
                  parameterName: newRow.parameter.value,
                  lowLimit: storageValue,
                })
              );
            } else if (changedProperty === "value") {
              dispatch(
                Actions.EditorActions.modifyValue({
                  commandName: newRow.command,
                  parameterName: newRow.parameter.value,
                  value: storageValue,
                })
              );
            } else if (changedProperty === "highLimit") {
              dispatch(
                Actions.EditorActions.modifyHighLimit({
                  commandName: newRow.command,
                  parameterName: newRow.parameter.value,
                  highLimit: storageValue,
                })
              );
            } else if (isPartNumber(changedProperty)) {
              dispatch(
                Actions.EditorActions.modifyPartNumberOverride({
                  commandName: newRow.command,
                  parameterName: newRow.parameter.value,
                  partNumber: changedProperty,
                  overrideValue: storageValue,
                })
              );
            } else {
              dispatch(
                Actions.EditorActions.modifyOperation({
                  commandName: newRow.command,
                  stationName: changedProperty,
                  operation: newRow[changedProperty],
                })
              );
            }
          }

          commitWaiters.current.splice(0).forEach((waiter) => waiter.resolve());
          return newRow;
        }}
        onProcessRowUpdateError={(error: any) => {
          commitWaiters.current.splice(0).forEach((waiter) => waiter.reject(error));
          console.error(error);
        }}
        rowSelectionModel={rowSelectionModel}
        onRowClick={(params) => {
          if (!hasFlashed) {
            setHasFlashed(true);
          }
          const encodedCommandName = encodeURIComponent(params.row.command);
          const encodedParameterName = encodeURIComponent(params.row.parameter.value);

          navigate(`/${memoryMapName}/${bomRevision}/${version}/${encodedCommandName}/${encodedParameterName}`, {
            replace: true,
          });
        }}
        getRowClassName={(params) => {
          if (flashingCellId === params.id) {
            return "row-flash";
          }
          return "";
        }}
      />
      {isDragOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "3px dashed #2e7d32",
            boxShadow: "0 0 12px 2px rgba(46, 125, 50, 0.6)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default MemoryMapGrid;
