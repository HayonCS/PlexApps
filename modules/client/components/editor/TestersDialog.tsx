import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  IconButton,
  Box,
  TextField,
  Divider,
  CircularProgress,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useDispatch, useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { Actions } from "modules/client/redux/actions";
import { useGetAllTestersAndTestStationsQuery } from "modules/client/graphql/types.gen";
import {
  buildInitialStationLists,
  buildTestersFromStations,
  computeAvailableTesterNames,
  moveCheckedItems,
  StationItem,
  TestersDialogContext,
} from "modules/client/components/editor/TestersDialog.utils";
import { StationTransferList } from "./StationTransferList";
import { useEditorSave } from "./EditorSaveContext";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "bold",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: "12px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const AddNewSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.primary.main,
  }),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
}));

export interface TestersDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TestersDialog: React.FC<TestersDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const memoryMapDocument = useSelector(Selectors.Editor.currentMemoryMap);
  const storedReadOnly = useSelector(Selectors.Editor.readOnly);
  const coordinator = useEditorSave();
  const readOnly = storedReadOnly || Boolean(coordinator?.pending);

  const { data, loading, error } = useGetAllTestersAndTestStationsQuery({
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  // eslint-disable-next-line no-undef
  const [left, setLeft] = React.useState<StationItem[]>([]);
  const [right, setRight] = React.useState<StationItem[]>([]);

  const [showAddTester, setShowAddTester] = React.useState(false);
  const [showAddStation, setShowAddStation] = React.useState(false);
  const [newTesterName, setNewTesterName] = React.useState("");
  const [newTesterDescription, setNewTesterDescription] = React.useState("");
  const [newStationTester, setNewStationTester] = React.useState("");
  const [newStationName, setNewStationName] = React.useState("");
  const [newStationDescription, setNewStationDescription] = React.useState("");

  React.useEffect(() => {
    if (data?.getAllTestersAndTestStations && memoryMapDocument) {
      const { available, assigned } = buildInitialStationLists(
        data.getAllTestersAndTestStations,
        memoryMapDocument.testers
      );
      setLeft(available);
      setRight(assigned);
    }
  }, [data, memoryMapDocument, open]);

  const handleToggle = (item: StationItem) => {
    const isUnassigned = left.includes(item);

    if (isUnassigned) {
      const newUnassigned = left.map((currentItem) => {
        if (currentItem.stationName === item.stationName) {
          item.checked = !item.checked;
          return item;
        }
        return currentItem;
      });
      setLeft(newUnassigned);
    } else {
      const newAssigned = right.map((currentItem) => {
        if (currentItem.stationName === item.stationName) {
          item.checked = !item.checked;
          return item;
        }
        return currentItem;
      });
      setRight(newAssigned);
    }
  };

  const assignStationsToMemoryMap = () => {
    const { source, dest } = moveCheckedItems(left, right);
    setLeft(source);
    setRight(dest);
  };

  const removeStationsFromMemoryMap = () => {
    const { source, dest } = moveCheckedItems(right, left);
    setRight(source);
    setLeft(dest);
  };

  const handleSave = () => {
    if (readOnly) return;
    const newTesters = buildTestersFromStations(
      right,
      memoryMapDocument?.testers,
      Object.keys(memoryMapDocument?.commands ?? {})
    );
    dispatch(Actions.EditorActions.updateTesters({ testers: newTesters }));
    onClose();
  };

  const availableTesters = React.useMemo(
    () => computeAvailableTesterNames(data?.getAllTestersAndTestStations, left),
    [data, left]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth={true}>
      <StyledDialogTitle>
        {`Manage Test Stations${readOnly ? " (Read-Only)" : ""}`}
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Error loading test stations: {error.message}</Typography>
        ) : (
          <>
            <TestersDialogContext.Provider
              value={{
                handleToggle: handleToggle,
              }}
            >
              <Grid
                container={true}
                spacing={2}
                justifyContent="center"
                alignItems="center"
                style={{ marginTop: "20px" }}
              >
                <Grid size={5}>
                  <StationTransferList listTitle={"Available Test Stations"} items={left} />
                </Grid>
                <Grid size={2}>
                  <Grid container={true} direction="column" sx={{ alignItems: "center" }}>
                    <Button
                      sx={{ my: 0.5 }}
                      variant="contained"
                      size="small"
                      onClick={assignStationsToMemoryMap}
                      disabled={!left.some((item) => item.checked) || readOnly}
                      aria-label="move selected right"
                    >
                      <ChevronRightIcon />
                    </Button>
                    <Button
                      sx={{ my: 0.5 }}
                      variant="contained"
                      size="small"
                      onClick={removeStationsFromMemoryMap}
                      disabled={!right.some((item) => item.checked) || readOnly}
                      aria-label="move selected left"
                    >
                      <ChevronLeftIcon />
                    </Button>
                  </Grid>
                </Grid>
                <Grid size={5}>
                  <StationTransferList listTitle={"Assigned to Memory Map"} items={right} />
                </Grid>
              </Grid>
            </TestersDialogContext.Provider>

            {!readOnly && (
              <AddNewSection sx={{ backgroundColor: "primary.main" }}>
                <Typography variant="subtitle2" gutterBottom={true}>
                  Add New
                </Typography>

                <Accordion
                  expanded={showAddTester}
                  onChange={(_, expanded) => setShowAddTester(expanded)}
                  sx={{ boxShadow: "none", "&:before": { display: "none" } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AddIcon fontSize="small" />
                      <Typography variant="body2">Add a new tester</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container={true} spacing={2}>
                      <Grid size={6}>
                        <TextField
                          fullWidth={true}
                          size="small"
                          label="Tester Name"
                          value={newTesterName}
                          onChange={(e) => setNewTesterName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={6}>
                        <TextField
                          fullWidth={true}
                          size="small"
                          label="Description"
                          value={newTesterDescription}
                          onChange={(e) => setNewTesterDescription(e.target.value)}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Button variant="contained" size="small" disabled={!newTesterName} startIcon={<AddIcon />}>
                          {"Add Tester"}
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          Note: After adding a tester, you can add stations to it using the form below.
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Divider sx={{ my: 2 }} />
                <Accordion
                  expanded={showAddStation}
                  onChange={(_, expanded) => setShowAddStation(expanded)}
                  sx={{ boxShadow: "none", "&:before": { display: "none" } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AddIcon fontSize="small" />
                      <Typography variant="body2">Add a new test station</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container={true} spacing={2}>
                      <Grid size={4}>
                        <TextField
                          select={true}
                          fullWidth={true}
                          size="small"
                          label="Tester"
                          value={newStationTester}
                          onChange={(e) => setNewStationTester(e.target.value)}
                          slotProps={{
                            select: {
                              native: true,
                            },
                          }}
                        >
                          <option value="">Select a tester</option>
                          {availableTesters.map((tester) => (
                            <option key={tester} value={tester}>
                              {tester}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={4}>
                        <TextField
                          fullWidth={true}
                          size="small"
                          label="Station Name"
                          value={newStationName}
                          onChange={(e) => setNewStationName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={4}>
                        <TextField
                          fullWidth={true}
                          size="small"
                          label="Description"
                          value={newStationDescription}
                          onChange={(e) => setNewStationDescription(e.target.value)}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!newStationTester || !newStationName}
                          startIcon={<AddIcon />}
                        >
                          {"Add Station"}
                        </Button>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </AddNewSection>
            )}
          </>
        )}
      </StyledDialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={readOnly}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
