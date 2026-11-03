import * as React from "react";
import { ConnectionChecker } from "modules/client/components/common/connection-display/ConnectionChecker";
import { NavigationSideDrawerClosedWidth } from "modules/client/styles/app-theme";
import { styled, Typography, Box } from "@mui/material";
import { socket } from "client/websocket-client";

const StyledMetricsPage = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 105px)",
  alignItems: "center",
  marginTop: "40px",
  paddingBottom: "50px",
  marginLeft: NavigationSideDrawerClosedWidth,
  gap: "20px",
  backgroundColor: theme.vars.palette.background.default,
}));

export const Metrics: React.FC = () => {
  return (
    <StyledMetricsPage>
      <Typography variant="h4" component="h1">
        Connection Status
      </Typography>
      <Box
        sx={{
          width: "80%",
          maxWidth: "800px",
          backgroundColor: (theme) => theme.vars.palette.background.paper,
          borderRadius: (theme) => theme.shape.borderRadius,
          padding: 2,
        }}
      >
        <ConnectionChecker socket={socket ?? undefined} />
      </Box>
    </StyledMetricsPage>
  );
};

// Keep Health as an alias for backward compatibility
export const Health = Metrics;
