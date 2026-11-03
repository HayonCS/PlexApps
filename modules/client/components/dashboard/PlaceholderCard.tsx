import * as React from "react";
import { Card, styled, Typography } from "@mui/material";

const StyledPlaceholderCard = styled(Card)(({ theme }) => ({
  minHeight: "200px",
  maxHeight: "200px",
  width: "100%",
  maxWidth: "350px",
  display: "flex",
  flexDirection: "column",
  pointer: "cursor",
  transition: "all 0.1s ease",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.15,
  border: "5px dashed grey",

  ".placeholderText": {
    fontSize: theme.typography.h1.fontSize,
    opacity: 0.4,
  },
}));

export const PlaceholderCard: React.FC<{}> = () => {
  return (
    <StyledPlaceholderCard data-testid="placeholder-card" elevation={5}>
      <Typography className={"placeholderText"}>Recent Memory</Typography>
      <Typography className={"placeholderText"}>Map</Typography>
    </StyledPlaceholderCard>
  );
};
