import * as React from "react";
import { Button, Card, styled, Tooltip, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router";
import { useIsWorkingCopyMemoryMap } from "modules/client/hooks/useIsWorkingCopyMemoryMap";
import WorkingCopyIcon from "@mui/icons-material/EditNote";
import ProdReleaseIcon from "@mui/icons-material/Star";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "200px",
  width: "100%",
  maxWidth: "350px",
  display: "flex",
  flexDirection: "column",
  pointer: "cursor",
  transition: "all 0.1s ease",
  "&:hover": {
    transform: "scale(1.05) translateY(5px)",
    transition: "all 0.1s ease",
    boxShadow: `0px 0px 20px 1px ${theme.vars.palette.secondary.dark}`,
    cursor: "pointer",
  },
  ".colorStrip": {
    minHeight: "33%",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: theme.palette.primary.main,
    paddingLeft: "30px",
    paddingRight: "30px",
    border: "4px solid",
    borderImageSlice: 1,
    borderImageSource: `linear-gradient(to right, transparent, ${theme.palette.secondary.main}, transparent)`,
    borderLeft: 0,
    borderRight: 0,
    borderTop: 0,
  },
  ".memoryMapText": {
    fontSize: theme.typography.h2.fontSize,
    flex: "0 0 0 120px",
    maxWidth: "300px",
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  ".infoPortion": {
    height: "67%",
    paddingLeft: "30px",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "15px",
  },
  ".lastEditorLabel": {
    fontSize: theme.typography.h4.fontSize,
  },
  ".lastAccessedLabel": {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  ".userIcon": {
    fontSize: "1rem",
    marginRight: "4px",
  },
  ".changelogButton": {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.secondary.dark,
  },
}));

export const RecentMemoryMapCard: React.FC<{
  memoryMapName: string;
  bomRevision: string;
  version: number;
  lastAccessed: string;
}> = (props) => {
  const navigate = useNavigate();
  const isWorkingCopy = useIsWorkingCopyMemoryMap(props.memoryMapName, props.bomRevision, props.version);
  const isProductionRelease = props.version === 1 ? true : false;

  const formattedDate = new Date(props.lastAccessed).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h11",
  });

  const formattedTooltipDate = new Date(props.lastAccessed).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h12",
  });

  return (
    <StyledCard
      data-testid={`recent-memorymap-card-${props.memoryMapName}-${props.bomRevision}-${props.version}`}
      onClick={() => {
        navigate(`/${props.memoryMapName}/${props.bomRevision}/${props.version}`);
      }}
      elevation={5}
    >
      <div className={"colorStrip"}>
        {isProductionRelease === true && <ProdReleaseIcon data-testid={"prod-release-icon"} />}
        {isWorkingCopy === true && isProductionRelease === false && (
          <WorkingCopyIcon data-testid={"working-copy-icon"} />
        )}
        <Typography noWrap={true} className={"memoryMapText"} data-testid={"memorymap-name"}>
          {props.memoryMapName}
        </Typography>
        <Typography noWrap={true} className={"memoryMapText"} data-testid={"memorymap-bom-revision"}>
          {props.bomRevision}
        </Typography>
        <Typography noWrap={true} className={"memoryMapText"} data-testid={"memorymap-version"}>
          {`v${props.version === 1 ? "1^" : props.version}`}
        </Typography>
      </div>
      <div className={"infoPortion"}>
        <Typography className={"lastEditorLabel"} data-testid={"last-editor-label"}>
          Last Edited By Someone
        </Typography>
      </div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          margin: "auto",
          width: "100%",
          marginBottom: "30px",
          paddingRight: "30px",
          paddingLeft: "30px",
        }}
      >
        <Button variant="contained" className={"changelogButton"} data-testid={"changelog-button"}>
          Changelog
        </Button>
        <div style={{ margin: "auto" }} />
        <Tooltip title={`You opened this memory map on ${formattedTooltipDate}.`} placement="bottom">
          <Typography
            noWrap={true}
            className={"lastAccessedLabel"}
            data-testid={"memorymap-last-accessed"}
            sx={{ display: "flex", alignItems: "center", flexDirection: "row" }}
          >
            {formattedDate}
          </Typography>
        </Tooltip>
      </Box>
    </StyledCard>
  );
};
