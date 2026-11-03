import * as React from "react";
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  styled,
  Tooltip,
} from "@mui/material";
import { Selectors } from "modules/client/redux/selectors";
import { useDispatch, useSelector } from "react-redux";
import { CommandSetParameter } from "modules/core/schemas/commandset.gen";
import { DirectionType, DirectionTypeString } from "modules/core/types";
import { Allotment } from "allotment";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import MemoryIcon from "@mui/icons-material/Memory";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Actions } from "modules/client/redux/actions";
import { COMMAND_DRAG_DATA_TYPE } from "./helper-functions";
import { useEditorSave } from "./EditorSaveContext";

const StyledCommandList = styled(List)(({ theme }) => ({
  overflow: "scroll",
  overflowX: "hidden",
  width: "100%",
  height: "100%",
  alignSelf: "center",
  position: "relative",
  "& > .Mui-selected": {
    borderRadius: theme.shape.borderRadius,
  },
  "& > :hover": {
    borderRadius: theme.shape.borderRadius,
  },
  ".subHeader": {
    "::after": {
      content: '" "',
      position: "absolute",
      width: "100%",
      height: "70%",
      top: "50%",
      left: 0,
      transform: "translate(5px, -50%)",
      zIndex: -1,
      borderRadius: theme.shape.borderRadius,
      background: `linear-gradient(to right, ${theme.palette.primary.main}, transparent)`,
    },
  },
}));

const StyledParameterList = styled(List)(({ theme }) => ({
  overflow: "scroll",
  overflowX: "hidden",
  width: "100%",
  height: "100%",
  alignSelf: "center",

  ".subHeader": {
    "::after": {
      content: '" "',
      position: "absolute",
      width: "100%",
      height: "70%",
      top: "50%",
      left: 0,
      transform: "translate(5px, -50%)",
      zIndex: -1,
      borderRadius: theme.shape.borderRadius,
      background: `linear-gradient(to right, ${theme.palette.primary.main}, transparent)`,
    },
  },
}));

const StyledCommandListContainer = styled("div")(({}) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
}));

const StyledDragHandle = styled(DragIndicatorIcon)(({ theme }) => ({
  cursor: "grab",
  color: theme.palette.text.secondary,
  marginRight: "4px",
  "&:active": {
    cursor: "grabbing",
  },
}));

/** Off-screen pill used as the native drag image so only the single command name appears while dragging. */
const StyledDragPreview = styled("div")(({ theme }) => ({
  position: "fixed",
  top: "-1000px",
  left: "-1000px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  borderRadius: "999px",
  fontFamily: "Roboto",
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.primary.main,
  boxShadow: theme.shadows[6],
  whiteSpace: "nowrap",
}));

const StyledParameterListItem = styled(ListItem)<{ direction: DirectionTypeString }>(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  variants: [
    {
      props: ({ direction }) => direction === "INPUT",
      style: {
        color: theme.vars.palette.parameterDirection.input,
      },
    },
    {
      props: ({ direction }) => direction === "OUTPUT",
      style: {
        color: theme.vars.palette.parameterDirection.output,
      },
    },
    {
      props: ({ direction }) => direction === "MEMORY",
      style: {
        color: theme.vars.palette.parameterDirection.memory,
      },
    },
  ],
}));

type ParameterList = {
  parameterName: string;
  direction: DirectionTypeString;
  type: string;
}[];

const GetParametersForCommand = (parameterList: ParameterList): React.ReactElement[] => {
  const parameters: React.ReactElement[] = [];

  parameterList.forEach((parameter, index) => {
    parameters.push(
      <StyledParameterListItem data-testid={"command-parameter"} direction={parameter.direction} key={index}>
        <ListItemIcon
          style={{
            color: "inherit",
            display: "flex",
            flexDirection: "row",
            alignSelf: "center",
            justifyContent: "center",
            flex: 0.1,
          }}
        >
          {parameter.direction === DirectionType.INPUT ? (
            <ZoomInMapIcon />
          ) : parameter.direction === DirectionType.OUTPUT ? (
            <ZoomOutMapIcon />
          ) : parameter.direction === DirectionType.MEMORY ? (
            <MemoryIcon />
          ) : (
            ""
          )}
        </ListItemIcon>
        <ListItemText style={{ display: "flex", justifyContent: "flex-start", flex: 1.5 }}>
          {parameter.parameterName}
        </ListItemText>
        <ListItemText style={{ display: "flex", justifyContent: "flex-start", flex: 0.5 }}>
          {parameter.type}
        </ListItemText>
      </StyledParameterListItem>
    );
  });

  return parameters;
};

export const CommandList: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const commandSetDocument = useSelector(Selectors.Editor.currentCommandSet);
  const selectedCommand = useSelector(Selectors.CommandSetManager.selectedCommand);
  const memoryMapDocument = useSelector(Selectors.Editor.currentMemoryMap);
  const storedReadOnly = useSelector(Selectors.Editor.readOnly);
  const coordinator = useEditorSave();
  const readOnly = storedReadOnly || Boolean(coordinator?.pending);

  const [commands, setCommands] = React.useState<string[]>([]);
  const [selectedCommandsParameters, setSelectedCommandsParameters] = React.useState<ParameterList>([]);
  const [draggingCommand, setDraggingCommand] = React.useState<string | null>(null);
  const dragPreviewRef = React.useRef<HTMLDivElement>(null);

  const addedCommands = React.useMemo(() => {
    return new Set(Object.keys(memoryMapDocument?.commands ?? {}).map((command) => command.toLowerCase()));
  }, [memoryMapDocument]);

  React.useEffect(() => {
    if (commandSetDocument) {
      if (commandSetDocument.commands) {
        setCommands(Object.keys(commandSetDocument.commands));
      }
    }
  }, [commandSetDocument]);

  React.useEffect(() => {
    if (selectedCommand) {
      if (commandSetDocument) {
        if (commandSetDocument.commands[selectedCommand]) {
          if (commandSetDocument.commands[selectedCommand].parameters) {
            const parameters = Object.keys(commandSetDocument.commands[selectedCommand].parameters).map(
              (parameterName) => {
                const parameterObject = commandSetDocument.commands[selectedCommand].parameters[
                  parameterName
                ] as CommandSetParameter;

                return {
                  parameterName: parameterName,
                  direction: parameterObject.direction,
                  type: parameterObject.type,
                };
              }
            );
            setSelectedCommandsParameters(parameters);
          }
        }
      }
    }
  }, [commandSetDocument, selectedCommand]);

  const selectedCommandRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedCommandRef.current) {
      selectedCommandRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [selectedCommand]);

  return (
    <StyledCommandListContainer>
      <StyledDragPreview ref={dragPreviewRef} />
      <Allotment separator={true} vertical={true} className={".allotment"}>
        <Allotment.Pane className={"commandListPanel"} maxSize={Infinity}>
          <StyledCommandList
            data-testid={"command-list"}
            id={"commandsetmanager-command-list"}
            dense={true}
            subheader={
              <ListSubheader className={"subHeader"} style={{ fontSize: "20px", color: "white" }}>
                {`Commands (${commands.length})`}
                <Divider />
              </ListSubheader>
            }
          >
            {commands.map((command, index) => {
              const isAdded = addedCommands.has(command.toLowerCase());

              return (
                <ListItemButton
                  data-testid={"command-list-command"}
                  key={index}
                  selected={selectedCommand?.toLowerCase() === command.toLowerCase()}
                  ref={selectedCommand?.toLowerCase() === command.toLowerCase() ? selectedCommandRef : null}
                  onClick={() => {
                    dispatch(Actions.CommandSetManagerActions.setSelectedCommand(command));
                  }}
                  component={"div"}
                  draggable={!readOnly}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(COMMAND_DRAG_DATA_TYPE, command);
                    event.dataTransfer.effectAllowed = "copy";
                    if (dragPreviewRef.current) {
                      dragPreviewRef.current.textContent = command;
                      event.dataTransfer.setDragImage(dragPreviewRef.current, -16, 16);
                    }
                    setDraggingCommand(command);
                  }}
                  onDragEnd={() => {
                    setDraggingCommand(null);
                  }}
                  style={{
                    marginLeft: "5px",
                    marginRight: "5px",
                    display: "flex",
                    flexDirection: "row",
                    opacity: draggingCommand?.toLowerCase() === command.toLowerCase() ? 0.4 : 1,
                  }}
                >
                  {!readOnly && <StyledDragHandle data-testid={"command-drag-handle"} fontSize={"small"} />}
                  <span style={{ flex: 1 }}>{command}</span>
                  {!readOnly && (
                    <Tooltip title={isAdded ? "Remove from memory map" : "Add to memory map"}>
                      <IconButton
                        data-testid={isAdded ? "command-remove-button" : "command-add-button"}
                        size={"small"}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isAdded) {
                            dispatch(Actions.EditorActions.removeCommand({ commandName: command }));
                          } else {
                            dispatch(Actions.EditorActions.addCommand({ commandName: command }));
                          }
                        }}
                      >
                        {isAdded ? (
                          <RemoveCircleOutlineIcon fontSize={"small"} color={"error"} />
                        ) : (
                          <AddCircleOutlineIcon fontSize={"small"} color={"success"} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemButton>
              );
            })}
          </StyledCommandList>
        </Allotment.Pane>
        {selectedCommand && commandSetDocument && (
          <Allotment.Pane className={"parameterListPanel"} maxSize={Infinity} minSize={100} preferredSize={300}>
            <StyledParameterList
              data-testid={"parameter-list"}
              dense={true}
              subheader={
                <ListSubheader className="subHeader" style={{ fontSize: "15px", color: "white" }}>
                  {`Parameters (${selectedCommandsParameters.length})`}
                  <Divider />
                </ListSubheader>
              }
            >
              {GetParametersForCommand(selectedCommandsParameters)}
            </StyledParameterList>
          </Allotment.Pane>
        )}
      </Allotment>
    </StyledCommandListContainer>
  );
};
