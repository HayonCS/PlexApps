import * as React from "react";

import { BugReport } from "./BugReport";
import { FreshserviceCatalogOptions } from "modules/client/graphql/types.gen";
import { Dialog } from "@mui/material";
import { useNotifications } from "@toolpad/core";
import { useDispatch, useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { Actions } from "modules/client/redux/actions";

export const BugReportDialog: React.FC<{
  catalog?: FreshserviceCatalogOptions;
}> = (props) => {
  const dispatch = useDispatch();
  const notifications = useNotifications();
  const bugReportDialogOpen = useSelector(Selectors.NavigationDrawer.bugReportDialogOpen);

  const handleClose = () => {
    dispatch(Actions.NavigationDrawerActions.setBugReportDialogOpen(false));
  };

  const handleSuccess = () => {
    handleClose();
    setTimeout(() => {
      notifications.show("Ticket successfully submitted!", {
        severity: "success",
        autoHideDuration: 5000,
      });
    }, 100);
  };

  const handleError = (message: string) => {
    setTimeout(() => {
      notifications.show(message || "Failed to submit ticket. Please try again.", {
        severity: "error",
        autoHideDuration: 5000,
      });
    }, 100);
  };

  return (
    <div>
      <Dialog
        data-testid="BugReportDialog"
        open={bugReportDialogOpen}
        onClose={handleClose}
        aria-labelledby="bug-report-dialog"
        fullWidth={true}
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.vars.palette.background.paper,
          },
        }}
      >
        <BugReport
          data-testid="BugReportComponent"
          catalog={props.catalog}
          onCancel={handleClose}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Dialog>
    </div>
  );
};
