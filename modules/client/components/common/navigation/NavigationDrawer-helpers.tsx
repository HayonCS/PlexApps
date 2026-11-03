import * as React from "react";
import {
  CSSObject,
  Drawer,
  List,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemIconProps,
  styled,
  Theme,
  Typography,
} from "@mui/material";
import { NavigationSideDrawerOpenWidth } from "modules/client/styles/app-theme";

export const openedMixin = (theme: Theme): CSSObject => ({
  width: NavigationSideDrawerOpenWidth,
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
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

export const StyledDrawerHeader = styled("div")(({ theme }) => [
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  theme.applyStyles("light", {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "& > button": {
      color: theme.palette.primary.contrastText,
    },
  }),
]);

export const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme }) => [
  {
    width: NavigationSideDrawerOpenWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
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
  },
  theme.applyStyles("light", {
    ".MuiDivider-root": {
      backgroundColor: theme.palette.primary.main,
    },
  }),
]);

export const StyledNavigationList = styled(List)(({ theme }) => [
  {},
  theme.applyStyles("light", {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  }),
]);

export interface ExtendedListItemButtonProps extends ListItemButtonProps {
  open?: boolean;
  active: boolean;
}

export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<ExtendedListItemButtonProps>(({ theme, active }) => [
  {
    minHeight: 48,
    px: 2.5,
    borderRadius: theme.shape.borderRadius,
    margin: "10px",
    boxShadow: active ? `0 0 20px 5px ${theme.palette.primary.main}` : "",
    variants: [
      {
        props: ({ open }) => open,
        style: {
          justifyContent: "initial",
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          justifyContent: "center",
        },
      },
    ],
  },
  theme.applyStyles("light", {
    boxShadow: active ? `0 0 20px 5px ${theme.palette.secondary.main}` : "",
  }),
]);

export interface ExtendedListItemIconProps extends ListItemIconProps {
  open?: boolean;
}

export const StyledListItemIcon = styled(ListItemIcon)<ExtendedListItemIconProps>(({ theme }) => [
  {
    minWidth: 0,
    justifyContent: "center",
    variants: [
      {
        props: ({ open }) => open,
        style: {
          marginRight: "10px",
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          marginRight: "auto",
        },
      },
    ],
  },
  theme.applyStyles("light", {
    color: "white",
  }),
]);

export const StyledNavigationHeader = styled(Typography)(({ theme }) => ({
  alignSelf: "center",
  fontFamily: "orbitron",
  fontWeight: "bold",
  fontSize: theme.typography.h3.fontSize,
  marginRight: "5%",
}));

export type NavigationItem = {
  displayName: string;
  tooltipTitle: string;
  link?: string;
  function?: () => void;
  icon: React.ReactNode;
  disabled?: () => boolean;
};
