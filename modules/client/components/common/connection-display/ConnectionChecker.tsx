import * as React from "react";
import { Box, Chip, styled, Typography } from "@mui/material";
import { Computer as ComputerIcon, Dns as DnsIcon, Cable as CableIcon } from "@mui/icons-material";
import { useConnectionStatus, ConnectionStatus } from "client/hooks/useConnectionStatus";
import { Socket } from "socket.io-client";

interface ConnectionCheckerProps {
  url?: string;
  socket?: Socket;
}

const getStatusColor = (status: ConnectionStatus) => {
  switch (status) {
    case "Connected":
      return "success";
    case "Disconnected":
      return "error";
    case "Loading ...":
      return "default";
  }
};

const StyledConnectionBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "flex-start",
  padding: theme.spacing(1),
  flexDirection: "column",
  backgroundColor: theme.vars.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  width: "100%",
  borderRadius: theme.shape.borderRadius,
}));

export const ConnectionChecker: React.FC<ConnectionCheckerProps> = ({ url = "/health", socket }) => {
  const { NetworkStatus, UrlStatus, WebsocketStatus, pingTime, lastChecked } = useConnectionStatus(url, socket);

  return (
    <StyledConnectionBox>
      <StyledChip
        icon={<ComputerIcon />}
        label={`Network: ${NetworkStatus}`}
        color={getStatusColor(NetworkStatus)}
        size="small"
      />
      <StyledChip
        icon={<DnsIcon />}
        label={`Server: ${UrlStatus}${pingTime ? ` (${pingTime}ms)` : ""}`}
        color={getStatusColor(UrlStatus)}
        size="small"
      />
      <StyledChip
        icon={<CableIcon />}
        label={`WebSocket: ${WebsocketStatus}`}
        color={getStatusColor(WebsocketStatus)}
        size="small"
      />
      {lastChecked && (
        <Typography variant="caption" sx={{ textAlign: "center", width: "100%" }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </Typography>
      )}
    </StyledConnectionBox>
  );
};
