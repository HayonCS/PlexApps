import * as React from "react";
import { Avatar, Button, IconButton, Popper, PopperProps, styled, Tooltip, Typography } from "@mui/material";
import { formatUserPhone } from "modules/client/utilities/user-util";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router";
import teamsIcon from "modules/client/icons/microsoftteams.png";
import outlookIcon from "client/icons/outlook.png";
import lumenIcon from "modules/client/icons/lumen.png";
import { Actions } from "modules/client/redux/actions";
import { useDispatch } from "react-redux";

const StyledDisplayPopper = styled(Popper)(({ theme }) => ({
  ".popperPaper": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "300px",
    width: "250px",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
    backgroundColor: theme.vars.palette.background.paper,
  },
  ".colorStrip": {
    backgroundColor: theme.vars.palette.primary.main,
    width: "100%",
    height: "30%",
    marginBottom: "30px",
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
  },
  ".avatarBorder": {
    position: "absolute",
    border: `3px solid ${theme.vars.palette.secondary.light}`,
    borderRadius: "50%",
    margin: "15px",
    marginBottom: "30px",
  },
  ".avatar": {
    height: "100px",
    width: "100px",
    border: `2px solid white`,
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
  },
  ".buttonContainer": {
    display: "flex",
    marginTop: "10px",
  },
  ".userInformationText": {
    justifySelf: "center",
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 500,
    fontFamily: theme.typography.fontFamily,
  },
  ".bottomButtonContainer": {
    width: "80%",
    display: "flex",
    margin: "15px",
  },
  ".bottomButton": {
    width: "40%",
    margin: "auto",
    backgroundColor: theme.vars.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    color: theme.vars.palette.primary.contrastText,
  },
}));

const StyledSlimDisplayPopper = styled(Popper)(({ theme }) => ({
  ".popperPaper": {
    display: "flex",
    flexDirection: "column",
    borderRadius: "1.5rem 1.5rem 1.5rem 1.5rem",
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
    paddingRight: "20px",
    paddingLeft: "20px",
    alignItems: "center",
    backgroundColor: "white",
  },
  ".userInformationContainer": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  ".userInformationText": {
    justifySelf: "center",
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 500,
  },
}));

const GetSocialButtons = (props: React.ComponentProps<typeof CurrentUserDisplayPopper>) => {
  return !props.slimDisplay ? (
    <div data-testid={"popper-social-buttons"} className={"buttonContainer"}>
      <IconButton
        className={"socialButton"}
        onClick={() => {
          window.open(`https://teams.microsoft.com/l/chat/0/0?users=${props.emailAddress}`);
        }}
      >
        <img src={teamsIcon} style={{ height: "20px", width: "20px" }} defaultValue={"Teams"} />
      </IconButton>
      <IconButton
        className={"socialButton"}
        onClick={() => {
          window.open(`mailto:${props.emailAddress}`);
        }}
      >
        <img src={outlookIcon} style={{ height: "20px", width: "20px" }} defaultValue={"Outlook"} />
      </IconButton>
      <IconButton
        className={"socialButton"}
        onClick={() => {
          window.open(`https://lumen.gentex.com/Person/${props.employeeNumber}`);
        }}
      >
        <img src={lumenIcon} style={{ height: "20px", width: "20px" }} defaultValue={"Lumen"} />
      </IconButton>
    </div>
  ) : (
    <div data-testid={"popper-social-buttons-slim"} className={"buttonContainer"}>
      <IconButton
        className={"socialButton"}
        onClick={() => {
          window.open(`https://teams.microsoft.com/l/chat/0/0?users=${props.emailAddress}`);
        }}
      >
        <img src={teamsIcon} style={{ height: "20px", width: "20px" }} defaultValue={"Teams"} />
      </IconButton>
      <IconButton
        className={"socialButton"}
        onClick={() => {
          window.open(`mailto:${props.emailAddress}`);
        }}
      >
        <img src={outlookIcon} style={{ height: "20px", width: "20px" }} defaultValue={"Outlook"} />
      </IconButton>
      <IconButton
        className={"socialButton"}
        onClick={() => {
          window.open(`https://lumen.gentex.com/Person/${props.employeeNumber}`);
        }}
      >
        <img src={lumenIcon} style={{ height: "20px", width: "20px" }} defaultValue={"Lumen"} />
      </IconButton>
    </div>
  );
};

const InnerComponents = (props: React.ComponentProps<typeof CurrentUserDisplayPopper>) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <>
      <div className={"colorStrip"} />
      {!props.slimDisplay && (
        <div className={"avatarBorder"}>
          <Avatar data-testid={"popper-user-avatar"} className={"avatar"} src={props.userPicture} />
        </div>
      )}
      {GetSocialButtons(props)}
      {!props.slimDisplay && (
        <>
          <div className={"userInformationContainer"}>
            <Typography data-testid={"popper-fullname"} className={"userInformationText"}>
              {`${props.fullName} (${props.readOnly === false ? "Author" : "User"})`}
            </Typography>
            <Typography data-testid={"popper-phone-number-formatted"} className={"userInformationText"}>
              {formatUserPhone(props.phoneNumber)}
            </Typography>
            <Typography data-testid={"popper-location"} className={"userInformationText"}>
              {props.location}
            </Typography>
            <Typography data-testid={"popper-email-address"} className={"userInformationText"}>
              {props.emailAddress}
            </Typography>
          </div>
        </>
      )}
      {!props.slimDisplay && (
        <div className={"bottomButtonContainer"}>
          <Tooltip slotProps={{ tooltip: { sx: { fontSize: "14px", fontFamily: "Roboto" } } }} title="Settings">
            <Button
              data-testid={"popper-button-settings"}
              className={"bottomButton"}
              onClick={() => {
                dispatch(Actions.UserSettingsActions.showUserSettings(true));
              }}
            >
              <SettingsIcon />
            </Button>
          </Tooltip>
          <Tooltip slotProps={{ tooltip: { sx: { fontSize: "14px", fontFamily: "Roboto" } } }} title="Logout">
            <Button
              data-testid={"popper-button-logout"}
              className={"bottomButton"}
              onClick={() => {
                navigate("/logout");
              }}
            >
              <LogoutIcon />
            </Button>
          </Tooltip>
        </div>
      )}
    </>
  );
};

export const CurrentUserDisplayPopper: React.FC<{
  userName: string;
  fullName: string;
  phoneNumber: string;
  location: string;
  emailAddress: string;
  employeeNumber: number;
  userPicture: string;
  readOnly?: boolean;
  open: boolean;
  setMouseOver: (isOver: boolean) => void;
  slimDisplay?: boolean;
  className?: string;
}> = (props) => {
  const componentId = `current-user-display-popper-${props.userName}`;

  const [anchorElement, setAnchorElement] = React.useState<PopperProps["anchorEl"]>(null);

  React.useEffect(() => {
    const el = document.getElementById(`current-user-display-${props.userName}`);
    setAnchorElement(el);
  }, [props.userName]);

  return !props.slimDisplay ? (
    <StyledDisplayPopper
      id={componentId}
      data-testid={componentId}
      slotProps={{
        root: {
          style: {
            zIndex: 1000000,
          },
        },
      }}
      open={props.open && Boolean(anchorElement)}
      anchorEl={anchorElement}
      onMouseEnter={() => {
        props.setMouseOver(true);
      }}
      onMouseLeave={() => {
        props.setMouseOver(false);
      }}
      placement="auto"
    >
      <div className={"popperPaper"}>{InnerComponents(props)}</div>
    </StyledDisplayPopper>
  ) : (
    <StyledSlimDisplayPopper
      id={componentId}
      data-testid={`${componentId}-slim`}
      open={props.open && Boolean(anchorElement)}
      anchorEl={anchorElement}
      onMouseEnter={() => {
        props.setMouseOver(true);
      }}
      onMouseLeave={() => {
        props.setMouseOver(false);
      }}
      placement="auto"
    >
      <div className={"popperPaper"}>{InnerComponents(props)}</div>
    </StyledSlimDisplayPopper>
  );
};
