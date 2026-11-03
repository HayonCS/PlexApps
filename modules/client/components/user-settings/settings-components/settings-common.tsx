import { ListItem, styled } from "@mui/material";

export const StyledSetting = styled(ListItem)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  ":hover": {
    backgroundColor: theme.vars?.palette.action.hover,
  },
  borderRadius: theme.shape.borderRadius,
  ".settingIcon": {
    height: "40px",
    width: "40px",
    display: "flex",
    alignItems: "center",
    color: theme.palette.secondary.main,
  },
  ".settingText": {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.vars?.palette.text.primary,
  },
  ".settingTextSecondary": {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: theme.typography.h5.fontSize,
    opacity: 0.3,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.vars?.palette.text.primary,
  },
}));
