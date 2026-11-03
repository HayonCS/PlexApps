import * as React from "react";
import { StationItem, TestersDialogContext } from "./TestersDialog.utils";
import { Box, Checkbox, List, ListItem, ListItemIcon, ListItemText, Paper, styled, Typography } from "@mui/material";

const TransferListPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  height: 350,
  overflow: "auto",
  scrollbarWidth: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

const TransferListHeader = styled(Box)(({ theme }) => ({
  padding: "8px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  fontWeight: "bold",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.primary.main,
  }),
}));

export const StationTransferList: React.FC<{
  listTitle: string;
  items: StationItem[];
  readOnly?: boolean;
}> = (props) => {
  const { listTitle, items, readOnly } = props;

  const testersDialogContext = React.useContext(TestersDialogContext);

  const groupedItems: Record<string, StationItem[]> = {};

  items.forEach((item) => {
    if (!groupedItems[item.testerName]) {
      groupedItems[item.testerName] = [];
    }
    groupedItems[item.testerName].push(item);
  });

  return (
    <TransferListPaper>
      <TransferListHeader>
        <Typography variant="subtitle2">{listTitle}</Typography>
        <Typography variant="caption" color="text.secondary">
          {items.length} station{items.length !== 1 ? "s" : ""}
        </Typography>
      </TransferListHeader>
      <List dense={true} component="div" role="list">
        {Object.entries(groupedItems).map(([testerName, stations]) => (
          <React.Fragment key={testerName}>
            <ListItem sx={{ backgroundColor: "action.hover", py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" color="white">
                    {testerName}
                  </Typography>
                }
              />
            </ListItem>
            {stations.map((item) => (
              <ListItem
                key={`${item.testerName}-${item.stationName}`}
                role="listitem"
                onClick={
                  readOnly
                    ? undefined
                    : testersDialogContext
                      ? () => {
                          testersDialogContext.handleToggle(item);
                        }
                      : undefined
                }
                sx={{
                  pl: 4,
                  cursor: readOnly ? "default" : "pointer",
                  "&:hover": readOnly ? {} : { backgroundColor: "action.selected" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    checked={item.checked}
                    tabIndex={-1}
                    disableRipple={true}
                    disabled={readOnly}
                    size="small"
                  />
                </ListItemIcon>
                <ListItemText primary={item.stationName} secondary={item.stationDescription || undefined} />
              </ListItem>
            ))}
          </React.Fragment>
        ))}
        {items.length === 0 && (
          <ListItem>
            <ListItemText secondary="No test stations" sx={{ textAlign: "center", fontStyle: "italic" }} />
          </ListItem>
        )}
      </List>
    </TransferListPaper>
  );
};
