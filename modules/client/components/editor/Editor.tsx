import React from "react";
import { useGetMemoryMap } from "modules/client/hooks/useGetMemoryMap";
import { Actions } from "modules/client/redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useBlocker, useNavigate, useParams } from "react-router";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, styled } from "@mui/material";
import { useApolloClient } from "@apollo/client";
import { useNotifications } from "@toolpad/core";
import { GetMemoryMapDocument } from "modules/client/graphql/types.gen";
import { sameMemoryMap, useSaveMemoryMap } from "modules/client/hooks/useSaveMemoryMap";
import { EditorSaveContext } from "./EditorSaveContext";
import {
  CommandSetManagerClosedWidth,
  CommandSetManagerOpenMaxWidth,
  CommandSetManagerOpenMinWidth,
  CommandSetManagerOpenPreferredWidth,
  NavigationSideDrawerClosedWidth,
} from "modules/client/styles/app-theme";
import MemoryMapGrid from "./MemoryMapGrid";
import { CommandSetManager } from "./CommandSetManager";
import { useGetCommandSet } from "modules/client/hooks/useGetCommandSet";
import { Selectors } from "modules/client/redux/selectors";
import { Allotment, setSashSize } from "allotment";
import { EditorToolbar } from "./EditorToolbar";

const StyledEditorPage = styled("div")(({ theme }) => ({
  height: "calc(100vh - 64px) ",
  display: "flex",
  paddingTop: "20px",
  flexDirection: "column",
  marginLeft: `calc(${NavigationSideDrawerClosedWidth} + 20px)`,
  paddingBottom: "20px",
  alignItems: "center",
  gap: "20px",
  marginRight: "20px",
  ".allotment": {
    ".sash": {
      borderRadius: theme.shape.borderRadius,
    },
    ".pane1": {
      paddingRight: "10px",
    },
    ".pane2": {
      right: 0,
      paddingLeft: "10px",
    },
  },
}));

export const Editor: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { memoryMapName, bomRevision, version } = useParams();
  const saveCoordinator = useSaveMemoryMap();
  const save = saveCoordinator.save;
  const client = useApolloClient();
  const notifications = useNotifications();
  const [reloadOpen, setReloadOpen] = React.useState(false);
  const [reloading, setReloading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const dirty = useSelector(Selectors.Editor.isMemoryMapModified);
  const hasToken = useSelector(Selectors.Editor.hasConcurrencyToken);
  const pending = saveCoordinator.pending || reloading;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (dirty || editing || pending) &&
      editorRouteIdentity(currentLocation.pathname) !== editorRouteIdentity(nextLocation.pathname)
  );
  React.useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        event.stopPropagation();
        if (!reloading) void save();
      }
    };
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (dirty || editing || pending) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    document.addEventListener("keydown", handleKey, true);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [dirty, editing, pending, reloading, save]);

  const memoryMapHookResponse = useGetMemoryMap(memoryMapName ?? "", bomRevision ?? "", parseInt(version!));
  const memoryMapDocument = useSelector(Selectors.Editor.currentMemoryMap);
  const commandSetManagerOpen = useSelector(Selectors.CommandSetManager.drawerOpen);

  const userIsReadOnly = useSelector(Selectors.Authentication.userIsReadOnly);

  const commandSetDocument = useGetCommandSet(
    memoryMapDocument?.commandset?.fileName ?? "",
    memoryMapDocument?.commandset?.revision ?? -1
  );

  React.useEffect(() => {
    if (commandSetDocument !== "ERROR" && commandSetDocument !== "LOADING") {
      dispatch(Actions.EditorActions.commandSetLoaded(commandSetDocument));
    }
  }, [commandSetDocument, dispatch]);

  const memoryMapRegex = /^\d{3}-\d{4}-\d{3}$/;
  const bomRevisionRegex = /^\w{1,3}/;
  const versionRegex = /^\d+$/;

  if (memoryMapName && bomRevision && version) {
    const validMemoryMap =
      memoryMapRegex.test(memoryMapName) && bomRevisionRegex.test(bomRevision) && versionRegex.test(version);

    if (!validMemoryMap) {
      navigate(
        { pathname: "/error" },
        {
          state: {
            error: "This url does not seem like a valid memory map!  Please double check the url that was entered.",
          },
        }
      );
    }
  }

  React.useEffect(() => {
    if (memoryMapHookResponse === "ERROR") {
      navigate(
        { pathname: "/error" },
        { state: { error: "Error loading memory map!  Verify that this memory map exists and can be loaded." } }
      );
    }
    if (
      memoryMapHookResponse !== "LOADING" &&
      memoryMapHookResponse !== "ERROR" &&
      memoryMapHookResponse.name === memoryMapName &&
      memoryMapHookResponse.bomRevision === bomRevision &&
      memoryMapHookResponse.version === Number(version) &&
      (memoryMapDocument?.name !== memoryMapHookResponse.name ||
        memoryMapDocument?.bomRevision !== memoryMapHookResponse.bomRevision ||
        memoryMapDocument?.version !== memoryMapHookResponse.version)
    ) {
      dispatch(Actions.EditorActions.memoryMapLoaded({ memoryMap: memoryMapHookResponse }));
    }
  }, [
    dispatch,
    memoryMapDocument?.bomRevision,
    memoryMapDocument?.name,
    memoryMapDocument?.version,
    memoryMapHookResponse,
    memoryMapName,
    bomRevision,
    version,
    navigate,
  ]);

  setSashSize(200);

  React.useEffect(() => {
    dispatch(
      Actions.EditorActions.setReadOnly(
        userIsReadOnly ||
          !memoryMapDocument?.isWorkingCopy ||
          memoryMapDocument?.name !== memoryMapName ||
          memoryMapDocument?.bomRevision !== bomRevision ||
          memoryMapDocument?.version !== Number(version)
      )
    );
  }, [
    dispatch,
    memoryMapDocument?.isWorkingCopy,
    memoryMapDocument?.name,
    memoryMapDocument?.bomRevision,
    memoryMapDocument?.version,
    memoryMapName,
    bomRevision,
    version,
    userIsReadOnly,
  ]);

  const reload = async () => {
    if (pending) return;
    setReloadOpen(false);
    setReloading(true);
    try {
      const result = await client.query({
        query: GetMemoryMapDocument,
        variables: { memoryMapName, bomRevision, version: Number(version) },
        fetchPolicy: "network-only",
      });
      const document = result.data?.getMemoryMap;
      if (!document || !sameMemoryMap(memoryMapDocument, document)) {
        throw new Error("Reload returned a different memory map.");
      }
      dispatch(Actions.EditorActions.memoryMapLoaded({ memoryMap: document }));
      saveCoordinator.clearConflict();
      setEditing(false);
    } catch (error) {
      notifications.show(`Reload failed: ${error instanceof Error ? error.message : String(error)}`, {
        severity: "error",
      });
    } finally {
      setReloading(false);
    }
  };

  return (
    <EditorSaveContext.Provider value={{ ...saveCoordinator, pending, reload: () => setReloadOpen(true), setEditing }}>
      <StyledEditorPage>
        {saveCoordinator.conflict && (
          <Alert
            severity="warning"
            action={
              <Button disabled={pending} onClick={() => setReloadOpen(true)}>
                Reload
              </Button>
            }
          >
            Server conflict. Your unsaved draft is preserved.
          </Alert>
        )}
        <EditorToolbar />
        <div style={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
          <Allotment className={"allotment"} separator={true}>
            <Allotment.Pane className={"pane1"} maxSize={Infinity}>
              <MemoryMapGrid />
            </Allotment.Pane>
            <Allotment.Pane
              className={"pane2"}
              maxSize={commandSetManagerOpen ? CommandSetManagerOpenMaxWidth : CommandSetManagerClosedWidth}
              preferredSize={CommandSetManagerOpenPreferredWidth}
              minSize={commandSetManagerOpen ? CommandSetManagerOpenMinWidth : CommandSetManagerClosedWidth}
            >
              <CommandSetManager />
            </Allotment.Pane>
          </Allotment>
        </div>
      </StyledEditorPage>
      <Dialog open={blocker.state === "blocked"} onClose={() => blocker.state === "blocked" && blocker.reset()}>
        <DialogTitle>Unsaved memory map</DialogTitle>
        <DialogContent>
          {pending
            ? "Wait for Save to finish before leaving."
            : "Save your changes before leaving, or discard this draft?"}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.state === "blocked" && blocker.reset()}>Cancel</Button>
          <Button
            disabled={pending}
            onClick={() => {
              if (blocker.state === "blocked") {
                dispatch(Actions.EditorActions.clearMemoryMap());
                blocker.proceed();
              }
            }}
          >
            Discard
          </Button>
          <Button
            disabled={pending || !hasToken}
            onClick={() => {
              void save().then((saved) => {
                if (saved && blocker.state === "blocked") blocker.proceed();
              });
            }}
          >
            Save and leave
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={reloadOpen} onClose={() => setReloadOpen(false)}>
        <DialogTitle>Discard draft and reload?</DialogTitle>
        <DialogContent>
          Reload replaces all local edits with the current server memory map. This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReloadOpen(false)}>Cancel</Button>
          <Button disabled={pending} onClick={() => void reload()}>
            Discard and reload
          </Button>
        </DialogActions>
      </Dialog>
    </EditorSaveContext.Provider>
  );
};

/** Row-selection routes append command/parameter segments; only the map identity matters. */
export const editorRouteIdentity = (pathname: string) => pathname.split("/").slice(0, 4).join("/");
