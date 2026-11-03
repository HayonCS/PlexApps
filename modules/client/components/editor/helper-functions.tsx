import {
  GridCellParams,
  GridColDef,
  GridComparatorFn,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowsProp,
  renderEditInputCell,
} from "@mui/x-data-grid-premium";
import { MemoryMapCommandParameter, MemoryMapDocument } from "modules/core/schemas/memory-map.gen";
import { OperationSelectorColumnType } from "modules/client/components/editor/OperationSelector";
import * as React from "react";
import { DirectionType, DisplayFormatType, OperationType } from "modules/core/types";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import MemoryIcon from "@mui/icons-material/Memory";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { useTheme } from "@mui/material/styles";
import { Tooltip } from "@mui/material";
import { isParameterValueWithinLimits } from "modules/client/utilities/validation/limit-bounds-check";

export const DIRECTION_COLORS_RGB: Record<string, [number, number, number]> = {
  input: [255, 165, 0], // Orange
  output: [0, 128, 0], // Green
  memory: [238, 130, 238], // Violet
  none: [255, 0, 0], // Red
};

export const COMMAND_DRAG_DATA_TYPE = "application/x-commandset-command";

const GetDirectionIcon = (direction: DirectionType) => {
  switch (direction) {
    case DirectionType.INPUT:
      return <ZoomInMapIcon />;
    case DirectionType.OUTPUT:
      return <ZoomOutMapIcon />;
    case DirectionType.MEMORY:
      return <MemoryIcon />;
    case DirectionType.NONE:
      return <ReportGmailerrorredIcon />;
  }
};

const GetParameterDisplayStyle = (direction: DirectionType) => {
  const style = {
    display: "flex",
    alignItems: "center",
    color: "black",
    justifyContent: "left",
    marginLeft: "10%",
    gap: "3px",
  };

  const theme = useTheme();

  switch (direction) {
    case DirectionType.INPUT:
      style.color = theme.vars.palette.parameterDirection?.input ?? "Orange";
      break;
    case DirectionType.OUTPUT:
      style.color = theme.vars.palette.parameterDirection?.output ?? "Green";
      break;
    case DirectionType.MEMORY:
      style.color = theme.vars.palette.parameterDirection?.memory ?? "Violet";
      break;
    case DirectionType.NONE:
      style.color = theme.vars.palette.parameterDirection?.none ?? "Red";
      break;
  }
  return style;
};

const gridParameterComparator: GridComparatorFn<MemoryMapCommandParameter> = (v1, v2) => {
  return v1.value < v2.value ? 1 : -1;
};

const handleBlur = ({ id, field, api }: GridRenderEditCellParams) => {
  api.stopCellEditMode({ id, field });
};

export const getMemoryMapGridColumns = (
  memoryMapDocument: MemoryMapDocument | null,
  readOnly: boolean,
  selectedFormat: DisplayFormatType
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: "command",
      headerName: "COMMAND",
      flex: 0.75,
      minWidth: 150,
      headerAlign: "center",
      align: "right",
      headerClassName: "columnHeader",
      renderCell: (params: GridRenderCellParams) => {
        const idString = params.id.toString();
        if (!idString.includes("index0")) {
          return <></>;
        } else {
          return <div style={{ marginRight: "10%" }}>{params.value}</div>;
        }
      },
    },
    {
      field: "parameter",
      headerName: "PARAMETER",
      flex: 0.75,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      headerClassName: "columnHeader",
      renderCell: (params: GridRenderCellParams) => {
        if (params.value) {
          if (memoryMapDocument) {
            if (memoryMapDocument.commands) {
              return (
                <div style={GetParameterDisplayStyle(params.value.direction)}>
                  <Tooltip title={params.value.direction}>{GetDirectionIcon(params.value.direction)}</Tooltip>
                  {params.value.value}
                </div>
              );
            }
          }
        }
      },
      valueFormatter: (value) => {
        if (typeof value === "object" && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      },
      sortComparator: gridParameterComparator,
    },
    {
      field: "direction",
      headerName: "DIRECTION",
      flex: 0.5,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      headerClassName: "columnHeader",
      valueGetter: (value, row) => {
        // Extract direction from the parameter object
        if (row.parameter && typeof row.parameter === "object" && "direction" in row.parameter) {
          return row.parameter.direction;
        }
        return "";
      },
    },
    {
      field: "lowLimit",
      headerName: "LOW LIMIT",
      flex: 0.5,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      headerClassName: "columnHeader",
      editable: !readOnly,
      cellClassName: (params: GridCellParams) => {
        const value = params.value as string;
        const isValid = isParameterValueWithinLimits(value, value, params.row.highLimit, selectedFormat);
        return isValid ? "" : "invalid-cell";
      },
      renderCell: (params: GridRenderCellParams) => {
        return <div data-testid={"lowLimit-cell"}>{params.value}</div>;
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const isValid = isParameterValueWithinLimits(params.value, params.value, params.row.highLimit, selectedFormat);
        return renderEditInputCell({
          ...params,
          error: !isValid,
          onBlur: () => handleBlur(params),
          slotProps: {
            root: { style: { width: `min(420px, max(100%, ${String(params.value ?? "").length + 4}ch))` } },
          },
          onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            e.target.select();
          },
        });
      },
    },
    {
      field: "value",
      headerName: "VALUE",
      flex: 0.5,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      headerClassName: "columnHeader",
      editable: !readOnly,
      cellClassName: (params: GridCellParams) => {
        const isValid = isParameterValueWithinLimits(
          params.value as string,
          params.row.lowLimit,
          params.row.highLimit,
          selectedFormat
        );
        return isValid ? "" : "invalid-cell";
      },
      renderCell: (params: GridRenderCellParams) => {
        return <div data-testid={"value-cell"}>{params.value}</div>;
      },
      renderEditCell: (params) => {
        const isValid = isParameterValueWithinLimits(
          params.value,
          params.row.lowLimit,
          params.row.highLimit,
          selectedFormat
        );
        const editInputCell = renderEditInputCell({
          ...params,
          error: !isValid,
          onBlur: () => handleBlur(params),
          inputProps: {
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              e.target.select();
            },
          },
        });

        return editInputCell;
      },
    },
    {
      field: "highLimit",
      headerName: "HIGH LIMIT",
      flex: 0.5,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      headerClassName: "columnHeader",
      editable: !readOnly,
      cellClassName: (params: GridCellParams) => {
        const value = params.value as string;
        const isValid = isParameterValueWithinLimits(value, params.row.lowLimit, value, selectedFormat);
        return isValid ? "" : "invalid-cell";
      },
      renderCell: (params: GridRenderCellParams) => {
        return <div data-testid={"highLimit-cell"}>{params.value}</div>;
      },
      renderEditCell: (params) => {
        const isValid = isParameterValueWithinLimits(params.value, params.row.lowLimit, params.value, selectedFormat);
        return renderEditInputCell({
          ...params,
          error: !isValid,
          onBlur: () => handleBlur(params),
          inputProps: {
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              e.target.select();
            },
          },
        });
      },
    },
  ];

  if (memoryMapDocument) {
    if (memoryMapDocument.testers) {
      const addedStations = new Set<string>();

      const testers = Object.keys(memoryMapDocument.testers);
      testers.forEach((testerName) => {
        const stations = Object.keys(memoryMapDocument.testers![testerName]);
        stations.forEach((stationName) => {
          const stationKey = stationName.toLowerCase();

          if (!addedStations.has(stationKey)) {
            addedStations.add(stationKey);

            columns.push({
              ...OperationSelectorColumnType,
              field: stationKey,
              headerName: stationName.toUpperCase(),
              headerAlign: "center",
              align: "center",
              headerClassName: "columnHeader",
              editable: !readOnly,
              valueGetter: (value, row) => {
                if (memoryMapDocument.testers) {
                  return row[stationKey];
                }
              },
              flex: 0.6,
              minWidth: 130,
            } as GridColDef);
          }
        });
      });
    }
  }

  if (memoryMapDocument) {
    if (memoryMapDocument.partNumbers) {
      const partNumbers = Object.keys(memoryMapDocument.partNumbers);
      partNumbers.forEach((partNumber) => {
        columns.push({
          field: `${partNumber.toLowerCase()}`,
          headerName: partNumber,
          headerAlign: "center",
          align: "center",
          headerClassName: "columnHeader",
          editable: !readOnly,
          flex: 0.5,
          minWidth: 120,

          valueGetter: (value, row) => {
            if (memoryMapDocument.partNumbers) {
              if (memoryMapDocument.partNumbers[partNumber]) {
                const commandName = row.command;
                const parameter = row.parameter;
                if (memoryMapDocument.partNumbers[partNumber][commandName]) {
                  const raw = memoryMapDocument.partNumbers[partNumber][commandName][parameter.value];
                  return raw === undefined
                    ? undefined
                    : DisplayFormatParameterValue(
                        selectedFormat,
                        raw,
                        memoryMapDocument.commands[commandName]?.parameters[parameter.value]?.datatype
                      );
                }
              }
            }
          },

          renderCell: (params: GridRenderCellParams) => {
            return <div>{params.value}</div>;
          },
          renderEditCell: (params) =>
            renderEditInputCell({
              ...params,
              onBlur: () => handleBlur(params),
              inputProps: {
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.select();
                },
              },
            }),
        } as GridColDef);
      });
    }
  }

  return columns;
};

export const DecimalStringToAsciiString = (decimalString: string): string => {
  const splitString = decimalString.split(" ");
  const asciiArray = splitString.map((string) => {
    const intValue = parseInt(string, 10);
    return String.fromCharCode(intValue);
  });

  return asciiArray.join(" ");
};

export const DecimalStringToHexString = (decimalString: string): string => {
  const splitString = decimalString.split(" ");
  const hexArray = splitString.map((stringPortion) => {
    const decimal = parseInt(stringPortion, 10);
    const hex = decimal.toString(16);
    const hexPadded = hex.padStart(2, "0");
    return `0x` + hexPadded.toUpperCase();
  });

  const newDisplay = hexArray.join(" ");
  return newDisplay;
};

export const DecimalStringToBinaryString = (decimalString: string): string => {
  const splitString = decimalString.split(" ");
  const binaryArray = splitString.map((stringPortion) => {
    const decimal = parseInt(stringPortion, 10);
    const binary = decimal.toString(2);
    const binaryPadded = binary.padStart(8, "0");
    return binaryPadded;
  });

  const newDisplay = binaryArray.join(" ");
  return newDisplay;
};

export const DisplayFormatParameterValue = (
  selectedFormat: DisplayFormatType,
  decimalValue: string,
  datatype?: string
): string => {
  if (
    datatype === "string" ||
    !decimalValue ||
    !decimalValue
      .trim()
      .split(/\s+/)
      .every((token) => /^-?\d+$/.test(token))
  ) {
    return decimalValue;
  }
  switch (selectedFormat) {
    case "ASCII":
      return DecimalStringToAsciiString(decimalValue);
    case "HEXADECIMAL":
      return DecimalStringToHexString(decimalValue);
    case "BINARY":
      return DecimalStringToBinaryString(decimalValue);
    case "DECIMAL":
      return decimalValue;
    default:
      return decimalValue;
  }
};

export const getMemoryMapGridRows = (
  selectedFormat: DisplayFormatType,
  memoryMapDocument: MemoryMapDocument | null
): GridRowsProp => {
  let rows: GridRowsProp = [];

  if (memoryMapDocument) {
    let paramsWithCommand: {}[] = [];
    const memoryMapDocumentSorted = Object.keys(memoryMapDocument.commands).sort();

    const operationsByCommand: Record<string, Record<string, string>> = {};

    // Collect all unique station names across all testers
    const allStationNames = new Set<string>();

    if (memoryMapDocument.testers) {
      Object.entries(memoryMapDocument.testers).forEach(([, tester]) => {
        Object.entries(tester).forEach(([stationName, stationOperations]) => {
          const stationKey = stationName.toLowerCase();
          allStationNames.add(stationKey);

          Object.entries(stationOperations).forEach(([commandName, operation]) => {
            if (!operationsByCommand[commandName]) {
              operationsByCommand[commandName] = {};
            }
            operationsByCommand[commandName][stationKey] = operation as string;
          });
        });
      });
    }

    // Create an object with all station fields initialized to OP_NOT_SET
    const emptyStations: Record<string, OperationType> = {};
    allStationNames.forEach((stationName) => {
      emptyStations[stationName] = OperationType.OP_NOT_SET;
    });

    memoryMapDocumentSorted.forEach((value) => {
      const parameters = Object.keys(memoryMapDocument.commands[value].parameters);
      parameters.forEach((param, index) => {
        const parameter = memoryMapDocument.commands[value].parameters[param];
        paramsWithCommand.push({
          id: `index${index}_${value}`,
          command: value,
          parameter: { value: param, direction: parameter.direction },
          lowLimit: DisplayFormatParameterValue(selectedFormat, parameter.lowLimit, parameter.datatype),
          value: DisplayFormatParameterValue(selectedFormat, parameter.value, parameter.datatype),
          highLimit: DisplayFormatParameterValue(selectedFormat, parameter.highLimit, parameter.datatype),
          ...emptyStations, // Initialize all station fields with OP_NOT_SET
          ...operationsByCommand[value], // Override with actual operations where they exist
        });
      });
    });
    rows = paramsWithCommand;
  }

  return rows;
};
