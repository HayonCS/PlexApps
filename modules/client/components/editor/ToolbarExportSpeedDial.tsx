import * as React from "react";
import { ClickAwayListener, SpeedDial, SpeedDialAction, styled, Tooltip } from "@mui/material";
import { GridCsvExportOptions, GridExcelExportOptions, useGridApiContext } from "@mui/x-data-grid-premium";
import { FaFileCsv as ExportCsvIcon, FaFilePdf as ExportPdfIcon } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill as ExportExcelIcon } from "react-icons/pi";
import { BiSolidFileExport as ExportIcon } from "react-icons/bi";
import { exportGridToPdf } from "./export-pdf-utils";
import { useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  height: "100%",
  pointerEvents: "all",
  ".speedDialFab": {
    width: "35px",
    height: "35px",
    backgroundColor: theme.vars.palette.secondary.main,
    display: "flex",
  },
  ".MuiSpeedDial-actions:not(.MuiSpeedDial-actionsClosed)": {
    position: "relative",
    "::after": {
      content: '" "',
      top: "23%",
      position: "absolute",
      backgroundColor: theme.palette.primary.main,
      height: "77%",
      width: "100%",
      borderRadius: theme.shape.borderRadius,
    },
  },
  ".MuiSpeedDialAction-fab": {
    backgroundColor: theme.palette.secondary.main,
    color: "white",
  },
}));

export const ToolbarExportSpeedDial: React.FC<{
  csvOptions?: GridCsvExportOptions;
  excelOptions?: GridExcelExportOptions;
}> = ({ csvOptions, excelOptions }) => {
  const apiRef = useGridApiContext();
  const [open, setOpen] = React.useState(false);
  const memoryMap = useSelector(Selectors.Editor.currentMemoryMap);

  const enablePdfExport = process.env.ENABLE_PDF_EXPORT;

  const SetMenuOpen = (open: boolean) => {
    setOpen(open);
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        SetMenuOpen(false);
      }}
    >
      <Tooltip title="Export" placement="top" enterDelay={1500}>
        <StyledSpeedDial
          ariaLabel="Export Menu"
          data-testid="export-speed-dial"
          direction="down"
          FabProps={{ className: "speedDialFab" }}
          icon={<ExportIcon size="18" />}
          open={open}
          onClick={() => {
            SetMenuOpen(!open);
          }}
        >
          <SpeedDialAction
            title={"Export As CSV"}
            aria-label="Export As CSV"
            onClick={() => {
              if (apiRef.current) {
                apiRef.current.exportDataAsCsv(csvOptions);
              }
            }}
            icon={<ExportCsvIcon size={"18"} />}
          />
          <SpeedDialAction
            title={"Export As Excel"}
            aria-label="Export As Excel"
            onClick={() => {
              if (apiRef.current) {
                void apiRef.current.exportDataAsExcel(excelOptions);
              }
            }}
            icon={<ExportExcelIcon size={"18"} />}
          />
          {enablePdfExport && (
            <SpeedDialAction
              title={"Export As PDF"}
              aria-label="Export As PDF"
              onClick={() => {
                if (apiRef.current && memoryMap) {
                  exportGridToPdf(apiRef, {
                    fileName: `${memoryMap.name}_${memoryMap.bomRevision}_${memoryMap.version}.pdf`,
                    title: `${memoryMap.name} / ${memoryMap.bomRevision} / ${memoryMap.version}`,
                  });
                }
              }}
              icon={<ExportPdfIcon size={"18"} />}
            />
          )}
        </StyledSpeedDial>
      </Tooltip>
    </ClickAwayListener>
  );
};
