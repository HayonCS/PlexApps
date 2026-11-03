import * as React from "react";
import { Avatar, Button, Container, styled, CssBaseline, TextField, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { LockOutlined } from "@mui/icons-material";
import { usingLocalAuth } from "client/auth";
import { login } from "client/redux/actions/thunks/authentication-thunks";
import * as AuthRoutes from "client/auth/authentication-routes";
import { useAppSelector } from "modules/client/redux/hooks/hooks";
import { AuthenticationSelectors } from "modules/client/redux/slices/authentication-slice";
import backgroundVideo from "modules/client/videos/background-video.webm";

const StyledContainer = styled(Container)<{ component: string }>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  gap: "10px",
  alignItems: "center",
  justifyContent: "center",

  ".appText": {
    color: "white",
    fontSize: "150px",
    fontFamily: "Orbitron",
  },
  ".paper": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: theme.palette.grey[900],
    opacity: 0.9,
    padding: "30px",
    borderRadius: theme.shape.borderRadius,
    width: "500px",
  },
  ".backgroundVideo": {
    height: "100vh",
    position: "fixed",
    zIndex: -1,
  },
  ".pageBackground": {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "black",
    height: "100%",
    width: "100%",
    zIndex: -2,
  },
  ".avatar": {
    margin: theme.spacing(1),
    backgroundColor: theme.vars?.palette.primary.main,
    height: "70px",
    width: "70px",
    color: "white",
  },
  ".lockIcon": {
    height: "30px",
    width: "30px",
  },
  ".form": {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  ".inputLabel": {
    color: "white !important",
    ".MuiFormLabel-root-MuiInputLabel-root.Mui-focused": {
      color: "white",
    },
  },
  ".notchedOutline": {
    borderWidth: "2px",
    borderColor: `${theme.vars?.palette.primary.main} !important`,
  },
  ".submit": {
    margin: theme.spacing(3, 0, 2),
  },
  ".phantom": {
    height: "300px",
    width: "1px",
  },
}));

export const Login: React.FC<{}> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const localAuth = usingLocalAuth();
  const [username, setUsername] = React.useState("");
  const dispatch = useDispatch<Dispatch<any>>();
  const authenticationType = useAppSelector(AuthenticationSelectors.type);
  const errorText = useAppSelector(AuthenticationSelectors.errorText);

  const redirectUrl = location.state?.from?.pathname || "/dashboard";

  const errorProps =
    authenticationType === "Error"
      ? {
          error: true,
          helperText: errorText ?? "Error logging in",
        }
      : { error: false };

  React.useEffect(() => {
    if (authenticationType === "Authenticated") {
      navigate(redirectUrl, { replace: true });
    }
  }, [authenticationType, navigate, redirectUrl]);

  return (
    <StyledContainer component="main" maxWidth="xs">
      <div className="pageBackground"></div>
      <Typography className={"appText"}>OpsManager</Typography>
      <video id={"background-video"} autoPlay={true} muted={true} loop={true} className={"backgroundVideo"}>
        <source src={backgroundVideo} type="video/webm" />
      </video>
      <CssBaseline />
      <div className="paper">
        <Avatar className={"avatar"}>
          <LockOutlined className={"lockIcon"} />
        </Avatar>
        <form
          className={"form"}
          noValidate={true}
          onSubmit={(event) => {
            event.preventDefault();
            if (localAuth) {
              dispatch(login(username));
            } else {
              window.open(AuthRoutes.LOGIN, "_self");
            }
          }}
        >
          {usingLocalAuth() && (
            <TextField
              slotProps={{
                inputLabel: {
                  className: "inputLabel",
                },
                input: {
                  className: "textFieldInput",
                  classes: {
                    notchedOutline: "notchedOutline",
                  },
                },
              }}
              variant="outlined"
              margin="normal"
              required={true}
              fullWidth={true}
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus={true}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              {...errorProps}
            />
          )}
          <Button type="submit" fullWidth={true} variant="contained" color="primary" className={"submit"}>
            {localAuth ? "Log In" : "Sign In"}
          </Button>
        </form>
      </div>
      <div className={"phantom"}></div>
    </StyledContainer>
  );
};
