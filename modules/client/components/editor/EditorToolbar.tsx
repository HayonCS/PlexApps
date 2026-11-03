import { IconButton, styled, Tooltip, Typography } from "@mui/material";
import { Selectors } from "modules/client/redux/selectors";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { ActionCreators } from "redux-undo";
import { TestersDialog } from "./TestersDialog";
import { useEditorSave } from "./EditorSaveContext";

const StyledEditorToolbar = styled("div")(({ theme }) => ({
  width: "100%",
  height: "60px",
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  paddingLeft: "20px",
  alignItems: "center",
  gap: "10px",
  ".memoryMapLabel": {
    fontWeight: "bold",
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h2.fontSize,
    textWrap: "nowrap",
    overflow: "ellipsis",
  },
  ".modeIcon": {
    fontSize: "1.3em",
  },
  ".chip": {
    display: "flex",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius,
    padding: "3px 6px 3px 6px",
    gap: "3px",
    animation: "shake 0.82s cubic-bezier(.36,.07,.19,.97) 1s 2 both",
  },
  ".editChip": {
    backgroundColor: "green",
  },
  ".readOnlyChip": {
    backgroundColor: theme.palette.grey[700],
  },
  "@keyframes shake": {
    "10%, 90%": {
      transform: "translate3d(-1px, 0, 0)",
    },

    "20%, 80%": {
      transform: "translate3d(2px, 0, 0)",
    },

    "30%, 50%, 70%": {
      transform: "translate3d(-4px, 0, 0)",
    },

    "40%, 60%": {
      transform: "translate3d(4px, 0, 0)",
    },
  },

  ".text": {
    fontFamily: theme.typography.fontFamily,
    fontWeight: "bold",
  },
}));

export const EditorToolbar: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const memoryMapDocument = useSelector(Selectors.Editor.currentMemoryMap);
  const readOnly = useSelector(Selectors.Editor.readOnly);
  const isMemoryMapModified = useSelector(Selectors.Editor.isMemoryMapModified);
  const hasRedos = useSelector(Selectors.Editor.hasRedos);
  const hasUndos = useSelector(Selectors.Editor.hasUndos);
  const hasToken = useSelector(Selectors.Editor.hasConcurrencyToken);
  const coordinator = useEditorSave();
  const pending = Boolean(coordinator?.pending);

  const [testersDialogOpen, setTestersDialogOpen] = React.useState(false);
  React.useEffect(() => {
    if (pending) setTestersDialogOpen(false);
  }, [pending]);

  const onUndo = () => {
    if (hasUndos && !pending) {
      dispatch(ActionCreators.undo());
    }
  };

  const onRedo = () => {
    if (hasRedos && !pending) {
      dispatch(ActionCreators.redo());
    }
  };

  return (
    <StyledEditorToolbar data-testid={"editor-toolbar"}>
      <div className={"memoryMapLabel"} data-testid={"memory-map-label"}>
        {memoryMapDocument?.name} / {memoryMapDocument?.bomRevision} /{" "}
        {memoryMapDocument?.version === 1 ? `1^` : memoryMapDocument?.version}
      </div>

      {readOnly === false ? (
        <Tooltip title={"Editable"} enterDelay={500}>
          <div className={"chip editChip"}>
            <EditIcon className={"modeIcon"} />
            <Typography className={"text"}>{"EDITABLE"}</Typography>
          </div>
        </Tooltip>
      ) : (
        <Tooltip title={"Read Only"} enterDelay={500}>
          <div className={"chip readOnlyChip"}>
            <EditOffIcon className={"modeIcon"} />
            <Typography className={"text"}>{"READ ONLY"}</Typography>
          </div>
        </Tooltip>
      )}
      {!readOnly && (
        <>
          <Tooltip title={"Save"}>
            <span>
              <IconButton
                aria-label="Save memory map"
                disabled={pending || !hasToken || (!coordinator && !isMemoryMapModified)}
                onMouseDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  void coordinator?.save();
                }}
                onClick={(event) => {
                  if (event.detail === 0) void coordinator?.save();
                }}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={"Undo"}>
            <span>
              <IconButton aria-label="Undo" disabled={!hasUndos || pending} onClick={onUndo} data-testid={"undoButton"}>
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={"Redo"}>
            <span>
              <IconButton aria-label="Redo" disabled={!hasRedos || pending} onClick={onRedo} data-testid={"redoButton"}>
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={"Manage Test Stations"}>
            <span>
              <IconButton
                aria-label="Manage test stations"
                disabled={pending}
                onClick={() => setTestersDialogOpen(true)}
                data-testid={"testersButton"}
              >
                <PrecisionManufacturingIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}
      <Typography role="status" aria-live="polite">
        {pending ? "Saving…" : isMemoryMapModified ? "Unsaved changes" : "Saved"}
      </Typography>
      {coordinator && (coordinator.conflict || !hasToken) && (
        <button disabled={pending} onClick={coordinator.reload}>
          Reload memory map
        </button>
      )}
      {!hasToken && memoryMapDocument && (
        <Typography role="alert">Restored draft has no server token. Reload before saving.</Typography>
      )}
      <TestersDialog open={testersDialogOpen && !pending} onClose={() => setTestersDialogOpen(false)} />
    </StyledEditorToolbar>
  );
};
