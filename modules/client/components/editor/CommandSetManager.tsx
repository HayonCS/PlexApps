import * as React from "react";
import { CSSObject, Divider, Drawer, Skeleton, styled, Theme, Tooltip, Typography } from "@mui/material";
import { MdKeyboardDoubleArrowLeft as DoubleArrowLeft } from "react-icons/md";
import { IoCloseCircleSharp as CloseIcon } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { CommandSetSelector } from "./CommandSetSelector";
import { CommandSetInfoDisplay } from "./CommandSetInfoDisplay";
import { CommandList } from "./CommandList";
import { Actions } from "modules/client/redux/actions";
import { CommandSetManagerClosedWidth } from "modules/client/styles/app-theme";
import { useEditorSave } from "./EditorSaveContext";

export const openedMixin = (theme: Theme): CSSObject => ({
  width: "100%",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

export const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: CommandSetManagerClosedWidth,
  [theme.breakpoints.up("sm")]: {
    width: CommandSetManagerClosedWidth,
  },
});

const StyledCommandSetManager = styled(Drawer)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.paper,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
  ".drawerPaper": {
    borderRadius: `${theme.vars.shape.borderRadius} 0 0 ${theme.vars.shape.borderRadius}`,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
}));

const StyledExpandButton = styled("div", { shouldForwardProp: (prop) => prop !== "drawerOpen" })<{
  drawerOpen: boolean;
}>(({ theme }) => [
  {
    backgroundColor: theme.vars.palette.grey["800"],
    color: theme.palette.text.secondary,
    borderRadius: theme.vars.shape.borderRadius,
    height: "100%",
    width: "30px",
    transition: "background-color ease-in-out 0.1s",
    "&:hover": {
      backgroundColor: theme.palette.secondary.main,
    },
    variants: [
      {
        props: ({ drawerOpen }) => drawerOpen,
        style: {
          display: "none",
        },
      },
      {
        props: ({ drawerOpen }) => !drawerOpen,
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    ],
  },
  theme.applyStyles("light", {
    backgroundColor: theme.vars.palette.primary.main,
  }),
]);

export const StyledDrawerHeader = styled("div")<{}>(({ theme }) => [
  {
    backgroundColor: theme.palette.primary.main,
    height: "54px",
    minHeight: "54px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
    justifyContent: "center",
    ".drawerHeaderText": {
      fontFamily: "Roboto",
      fontWeight: theme.typography.fontWeightBold,
      fontSize: theme.typography.h3.fontSize,
      color: theme.palette.text.secondary,
    },
  },
]);

export const StyledCloseIcon = styled(CloseIcon)(({ theme }) => [
  {
    position: "absolute",
    right: 10,
    color: theme.palette.text.secondary,
  },
]);

const StyledCommandSetManagerSkeleton = styled(Skeleton)(({ theme }) => ({
  width: "100%",
  height: "50px",
  backgroundColor: theme.palette.grey[800],
  borderRadius: theme.shape.borderRadius,
}));

export const CommandSetManager: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const [currentCommandSet, setCurrentCommandSet] = React.useState<string>("");

  const memoryMap = useSelector(Selectors.Editor.currentMemoryMap);
  const drawerOpen = useSelector(Selectors.CommandSetManager.drawerOpen);
  const storedReadOnly = useSelector(Selectors.Editor.readOnly);
  const coordinator = useEditorSave();
  const isReadOnly = storedReadOnly || Boolean(coordinator?.pending);

  React.useEffect(() => {
    if (memoryMap) {
      if (memoryMap.commandset) {
        setCurrentCommandSet(memoryMap.commandset.fileName);
      }
    }
  }, [memoryMap]);

  return memoryMap && memoryMap.commandset ? (
    <StyledCommandSetManager
      data-testid={"commandset-manager"}
      variant="permanent"
      open={drawerOpen}
      slotProps={{ paper: { className: "drawerPaper" } }}
    >
      <Tooltip title={"Manage Commandset"}>
        <StyledExpandButton
          data-testid={"expand-button"}
          className={"expandButton"}
          onClick={() => {
            dispatch(Actions.CommandSetManagerActions.setDrawerOpen(true));
          }}
          drawerOpen={drawerOpen}
        >
          <DoubleArrowLeft size={20} />
        </StyledExpandButton>
      </Tooltip>
      {drawerOpen && (
        <>
          <StyledDrawerHeader data-testid={"header-text"}>
            <Typography className={"drawerHeaderText"}>COMMANDSET MANAGER</Typography>
            <StyledCloseIcon
              size={25}
              onClick={() => {
                dispatch(Actions.CommandSetManagerActions.setDrawerOpen(false));
              }}
            />
          </StyledDrawerHeader>
          <CommandSetSelector currentCommandSetName={currentCommandSet} readOnly={isReadOnly} />
          <CommandSetInfoDisplay
            version={memoryMap.commandset.revision}
            description={memoryMap.commandset.description !== "" ? memoryMap.commandset.description : undefined}
          />
          <Divider style={{ marginBottom: "-20px" }} />
          <CommandList />
        </>
      )}
    </StyledCommandSetManager>
  ) : (
    <StyledCommandSetManager variant="permanent" open={drawerOpen} slotProps={{ paper: { className: "drawerPaper" } }}>
      <StyledCommandSetManagerSkeleton />
    </StyledCommandSetManager>
  );
};

export default CommandSetManager;
