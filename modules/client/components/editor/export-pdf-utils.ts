import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { GridApi, gridExpandedSortedRowIdsSelector } from "@mui/x-data-grid-premium";
import type { MutableRefObject } from "react";
import { DIRECTION_COLORS_RGB } from "./helper-functions";

export interface PdfExportOptions {
  fileName?: string;
  title?: string;
}

const FIXED_HEADER_NAMES = ["COMMAND", "PARAMETER", "DIRECTION", "LOW LIMIT", "VALUE", "HIGH LIMIT"];
// A4 landscape safely fits ~13 columns at 8pt font without horizontal overflow
const MAX_COLUMNS_TOTAL = 13;
const MAX_VARIABLE_COLUMNS_PER_PAGE = 3;
// Variable columns per export = total cap minus the fixed columns
const MAX_VARIABLE_COLUMNS_TOTAL = MAX_COLUMNS_TOTAL - FIXED_HEADER_NAMES.length;

// Columns to which direction-based text colours are applied in the PDF
const COLORED_HEADER_NAMES = new Set(["PARAMETER", "DIRECTION", "VALUE", "LOW LIMIT", "HIGH LIMIT"]);

const renderTable = (
  doc: jsPDF,
  chunkHeaders: string[],
  data: string[][],
  rowDirections: string[],
  isFirstPage: boolean,
  title: string,
  pageLabel: string
) => {
  if (!isFirstPage) {
    doc.addPage();
  }

  doc.setFontSize(16);
  doc.text(title, 14, 15);

  if (pageLabel) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(pageLabel, 14, 21);
    doc.setTextColor(0);
  }

  // Indices of coloured columns within this chunk
  const coloredIndices = new Set(
    chunkHeaders.map((h, i) => (COLORED_HEADER_NAMES.has(h) ? i : -1)).filter((i) => i !== -1)
  );

  autoTable(doc, {
    head: [chunkHeaders],
    body: data,
    startY: 27,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202], // Bootstrap blue
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 27 },
    didParseCell: (cellData) => {
      if (cellData.section === "body") {
        const colIndex = cellData.column.index;
        // Right-align COMMAND column, center-align the rest
        if (colIndex === 0) {
          cellData.cell.styles.halign = "right";
        } else {
          cellData.cell.styles.halign = "center";
        }

        // Apply direction color to fixed styled columns
        const direction = rowDirections[cellData.row.index];
        if (direction && DIRECTION_COLORS_RGB[direction] && coloredIndices.has(colIndex)) {
          cellData.cell.styles.textColor = DIRECTION_COLORS_RGB[direction];
        }
      }
    },
  });
};

export const exportGridToPdf = (apiRef: MutableRefObject<GridApi>, options?: PdfExportOptions) => {
  const { fileName = "export.pdf", title = "Export" } = options || {};

  // Get visible columns, exclude internal DataGrid columns
  const allColumns = apiRef.current.getVisibleColumns().filter((col) => {
    return col.field !== "__check__" && !col.field.startsWith("__");
  });

  // Separate into fixed and variable columns by header name.
  // Sort fixed columns in canonical FIXED_HEADER_NAMES order regardless of grid column order.
  const allColumnsMap = new Map(allColumns.map((col) => [(col.headerName || col.field).toUpperCase(), col]));
  const fixedColumns = FIXED_HEADER_NAMES.flatMap((name) => {
    const col = allColumnsMap.get(name);
    return col ? [col] : [];
  });
  const variableColumns = allColumns
    .filter((col) => !FIXED_HEADER_NAMES.includes((col.headerName || col.field).toUpperCase()))
    .slice(0, MAX_VARIABLE_COLUMNS_TOTAL);

  // Get row IDs respecting active quick-filter / row filters
  const rowIds = gridExpandedSortedRowIdsSelector(apiRef);

  // Pre-compute cell values and row directions for all columns
  const rowDirections: string[] = [];
  const allColumnValues: Map<string, string[]> = new Map();

  allColumns.forEach((col) => {
    allColumnValues.set(col.field, []);
  });

  rowIds.forEach((id) => {
    let rowDirection = "";
    allColumns.forEach((col) => {
      const value = apiRef.current.getCellValue(id, col.field);
      let cellText = "";
      if (value && typeof value === "object") {
        if ("value" in value) {
          if ("direction" in value && value.direction) {
            rowDirection = String(value.direction).toLowerCase();
          }
          cellText = String(value.value ?? "");
        } else {
          cellText = JSON.stringify(value);
        }
      } else {
        cellText = String(value ?? "");
      }
      allColumnValues.get(col.field)!.push(cellText);
    });
    rowDirections.push(rowDirection);
  });

  // Helper to build table data for a given set of columns
  const buildTableData = (cols: typeof allColumns): string[][] => {
    return rowIds.map((_, rowIndex) => {
      return cols.map((col) => allColumnValues.get(col.field)![rowIndex]);
    });
  };

  // Chunk variable columns into groups of MAX_VARIABLE_COLUMNS_PER_PAGE
  const variableChunks: (typeof variableColumns)[] = [];
  if (variableColumns.length === 0) {
    variableChunks.push([]);
  } else {
    for (let i = 0; i < variableColumns.length; i += MAX_VARIABLE_COLUMNS_PER_PAGE) {
      variableChunks.push(variableColumns.slice(i, i + MAX_VARIABLE_COLUMNS_PER_PAGE));
    }
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Render one page per chunk
  variableChunks.forEach((chunk, chunkIndex) => {
    const chunkCols = [...fixedColumns, ...chunk];
    const chunkHeaders = chunkCols.map((col) => (col.headerName || col.field).toUpperCase());
    const chunkData = buildTableData(chunkCols);
    const pageLabel =
      variableChunks.length > 1
        ? `Columns ${chunkIndex * MAX_VARIABLE_COLUMNS_PER_PAGE + 1}-${Math.min(
            (chunkIndex + 1) * MAX_VARIABLE_COLUMNS_PER_PAGE,
            variableColumns.length
          )} of ${variableColumns.length} (page ${chunkIndex + 1} of ${variableChunks.length})`
        : "";
    renderTable(doc, chunkHeaders, chunkData, rowDirections, chunkIndex === 0, title, pageLabel);
  });

  doc.save(fileName);
};
