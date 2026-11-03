import * as React from "react";
import { Divider, IconButton, ListItem, ListItemText, Paper, Popper, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useDispatch, useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { Actions } from "modules/client/redux/actions";
import { FaHome as DashboardIcon } from "react-icons/fa";
import { MdOutlineBugReport as BugReportIcon } from "react-icons/md";
import { RiHistoryFill as ChangelogIcon } from "react-icons/ri";

import { BiSolidEdit as EditorIcon } from "react-icons/bi";
import { TbDeviceAnalytics as AnalyticsIcon } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router";
import { IoMdSettings as SettingsIcon } from "react-icons/io";
import { useDebouncedCallback } from "use-debounce";
import { ConnectionChecker } from "../connection-display/ConnectionChecker";
import { socket } from "client/websocket-client";
import { BugReportDialog } from "../bug-report/BugReportDialog";
import { ChangeLogDialog } from "../changelog/ChangeLogDialog";
import {
  StyledDrawerHeader,
  NavigationItem,
  StyledDrawer,
  StyledListItemButton,
  StyledListItemIcon,
  StyledNavigationHeader,
  StyledNavigationList,
} from "./NavigationDrawer-helpers";

export const NavigationDrawer: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerOpen = useSelector(Selectors.NavigationDrawer.drawerOpen);
  const changelogDialogOpen = useSelector(Selectors.NavigationDrawer.changelogDialogOpen);
  const bugReportDialogOpen = useSelector(Selectors.NavigationDrawer.bugReportDialogOpen);
  const memoryMap = useSelector(Selectors.Editor.currentMemoryMap);

  const [hovered, setHovered] = React.useState<boolean>(false);
  const [metricsAnchorEl, setMetricsAnchorEl] = React.useState<HTMLElement | null>(null);

  const HandleNavigationItemClick = (path: string) => {
    navigate(path);
    dispatch(Actions.NavigationDrawerActions.setDrawerOpen(false));
  };

  const HandleNavigationDrawerMouseExit = useDebouncedCallback(() => {
    if (!hovered) {
      dispatch(Actions.NavigationDrawerActions.setDrawerOpen(false));
    }
  }, 200000);

  const drawerRef = React.useRef<any>(null);

  const navigationItems: NavigationItem[] = [
    {
      displayName: "Dashboard",
      link: "/dashboard",
      tooltipTitle: "Dashboard",
      icon: <DashboardIcon size="25" />,
    },
    {
      displayName: "Editor",
      link: `/${memoryMap?.name}/${memoryMap?.bomRevision}/${memoryMap?.version}`,
      tooltipTitle:
        memoryMap === null
          ? `Editor`
          : `Editor (${memoryMap?.name} / ${memoryMap?.bomRevision} / ${memoryMap?.version})`,
      icon: <EditorIcon size="25" />,
      disabled: () => {
        return memoryMap === null;
      },
    },
    {
      displayName: "Health",
      link: "/health",
      tooltipTitle: "Health",
      icon: <AnalyticsIcon size="25" />,
    },
    {
      displayName: "Report a Problem",
      function: () => {
        if (!bugReportDialogOpen) {
          dispatch(Actions.NavigationDrawerActions.setBugReportDialogOpen(true));
        } else {
          dispatch(Actions.NavigationDrawerActions.setBugReportDialogOpen(false));
        }
      },
      tooltipTitle: "Report a Problem",
      icon: <BugReportIcon size="25" />,
    },
    {
      displayName: "Changelog",
      function: () => {
        if (!changelogDialogOpen) {
          dispatch(Actions.NavigationDrawerActions.setChangelogDialogOpen(true));
        } else {
          dispatch(Actions.NavigationDrawerActions.setChangelogDialogOpen(false));
        }
      },
      tooltipTitle: "View Changelog",
      icon: <ChangelogIcon size="25" />,
    },
    {
      displayName: "Settings",
      function: () => {
        dispatch(Actions.UserSettingsActions.showUserSettings(true));
      },
      tooltipTitle: "User Settings",
      icon: <SettingsIcon size="25" />,
    },
  ];

  return (
    <StyledDrawer
      data-testid={"navigation-drawer"}
      ref={drawerRef}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        HandleNavigationDrawerMouseExit();
      }}
      variant="permanent"
      open={drawerOpen}
    >
      <StyledDrawerHeader data-testid={"navigation-drawer-header"}>
        <StyledNavigationHeader>NAVIGATION</StyledNavigationHeader>
        <IconButton
          onClick={() => {
            dispatch(Actions.NavigationDrawerActions.setDrawerOpen(!drawerOpen));
          }}
        >
          {<ChevronLeftIcon />}
        </IconButton>
      </StyledDrawerHeader>
      <Divider />
      <StyledNavigationList sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {navigationItems.map((item, index) => {
          const isHealth = item.displayName === "Health";
          const itemContent = (
            <ListItem
              key={index}
              disablePadding={true}
              sx={{ display: "block", marginTop: item.displayName === "Health" ? "auto" : "" }}
              data-testid={`navigation-item-${item.displayName.toLowerCase().replace(/ /g, "-")}`}
              onMouseEnter={(e) => {
                if (isHealth) {
                  setMetricsAnchorEl(e.currentTarget);
                }
              }}
              onMouseLeave={() => {
                if (isHealth) {
                  setMetricsAnchorEl(null);
                }
              }}
            >
              <StyledListItemButton
                active={typeof item.link === "string" && location.pathname.includes(item.link)}
                onClick={() => {
                  if (item.link) {
                    HandleNavigationItemClick(item.link);
                  } else if (item.function) {
                    item.function();
                  }
                }}
                open={drawerOpen}
                disabled={item.disabled && item.disabled()}
              >
                <StyledListItemIcon open={drawerOpen}>{item.icon}</StyledListItemIcon>
                <ListItemText
                  primary={item.displayName}
                  sx={[
                    drawerOpen
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </StyledListItemButton>
            </ListItem>
          );
          return isHealth ? (
            itemContent
          ) : (
            <Tooltip key={index} title={item.tooltipTitle} placement="right">
              {itemContent}
            </Tooltip>
          );
        })}
      </StyledNavigationList>
      <Popper
        open={Boolean(metricsAnchorEl)}
        anchorEl={metricsAnchorEl}
        placement="right"
        sx={{
          zIndex: (theme) => theme.zIndex.tooltip,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            pointerEvents: "auto",
            backgroundColor: (theme) => theme.vars.palette.background.paper,
          }}
          onMouseEnter={() => setMetricsAnchorEl(metricsAnchorEl)}
          onMouseLeave={() => setMetricsAnchorEl(null)}
        >
          <ConnectionChecker socket={socket ?? undefined} />
        </Paper>
      </Popper>
      <BugReportDialog />
      <ChangeLogDialog />
    </StyledDrawer>
  );
};
