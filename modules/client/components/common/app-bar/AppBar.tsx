import * as React from "react";
import AppBar, { AppBarProps } from "@mui/material/AppBar";
import { IconButton, Toolbar, Tooltip, Typography, styled } from "@mui/material";
import { AppBarSettings, NavigationSideDrawerOpenWidth } from "modules/client/styles/app-theme";
import { GentexLogo } from "modules/client/icons/GentexLogo";
import { Chevron } from "modules/client/icons/Chevron";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "modules/client/redux/actions";
import { Selectors } from "modules/client/redux/selectors";
import { useNavigate } from "react-router";
import MenuIcon from "@mui/icons-material/Menu";
import { CurrentUserDisplay } from "../current-user-display/CurrentUserDisplay";

interface ExtendedAppBarProps extends AppBarProps {
  open?: boolean;
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<ExtendedAppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: NavigationSideDrawerOpenWidth,
        width: `calc(100% - ${NavigationSideDrawerOpenWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
  ".appBarText": {
    fontSize: `${AppBarSettings.appNameSize}`,
    fontFamily: "Orbitron",
    fontWeight: "bold",
  },
}));

export default function OpsManagerAppBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userName = useSelector(Selectors.Authentication.currentUserName);
  const readOnlyUser = useSelector(Selectors.Authentication.userIsReadOnly);
  const drawerOpen = useSelector(Selectors.NavigationDrawer.drawerOpen);

  const readOnlyFeatureMode = process.env.READ_ONLY_MODE === "true" ? true : false;
  const endpoint = process.env.APP_ENDPOINT;

  const handleDrawerOpen = () => {
    dispatch(Actions.NavigationDrawerActions.setDrawerOpen(true));
  };

  return (
    <StyledAppBar data-testid={"app-bar"} sx={{ position: "sticky" }} enableColorOnDark={true} open={drawerOpen}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={[
            {
              marginRight: 5,
            },
            drawerOpen && { display: "none" },
          ]}
        >
          <MenuIcon />
        </IconButton>
        <div
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => {
            navigate({ pathname: "/dashboard", search: "" }, { replace: true });
          }}
        >
          <GentexLogo data-testid={"gentex-logo"} sx={{ width: AppBarSettings.logoSize }} />
          <Chevron
            data-testid={"chevron"}
            sx={{ height: AppBarSettings.chevronSize, marginRight: "8px", marginLeft: "8px" }}
          />
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <Tooltip title="Click to return to dashboard">
              <Typography
                className={"appBarText"}
                data-testid={"appbar-title"}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                {`OPERATIONS MANAGER${endpoint !== "prod" ? " - " + endpoint?.toUpperCase() : ""}`}
              </Typography>
            </Tooltip>
            {readOnlyFeatureMode && <Typography style={{ color: "light-red" }}>(READ-ONLY MODE)</Typography>}
          </div>
        </div>
        <div style={{ margin: "auto" }} />
        <CurrentUserDisplay userName={userName} readOnly={readOnlyUser} />
      </Toolbar>
    </StyledAppBar>
  );
}
