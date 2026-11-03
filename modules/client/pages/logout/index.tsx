import * as React from "react";
import { clearAuthToken } from "client/auth";
import { logout } from "client/redux/actions/thunks/authentication-thunks";
import { styled, Typography } from "@mui/material";
import backgroundVideo from "modules/client/videos/background-video.webm";

const StyledDiv = styled("div")<{}>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "80vh",
  ".headerText": {
    fontFamily: "Orbitron",
    fontSize: "100px",
    color: "white",
  },

  ".subText": {
    fontFamily: "Orbitron",
    fontSize: "30px",
    color: "white",
  },
  ".backgroundVideo": {
    height: "100vh",
    position: "fixed",
    top: 0,
    zIndex: -1,
  },
  ".loginButton": {
    width: "100px",
    height: "40px",
    backgroundColor: "#0d51a6",
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    textDecoration: "none",
    fontFamily: "Roboto",
    fontSize: "12px",
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
}));

export const LogOut: React.FC<{}> = () => {
  React.useEffect(() => {
    clearAuthToken();
    logout();
  });

  /**
   * NOTE: Using a manual link below will insure that we do not have any
   * weird race conditions with React Router. If you use Link (which is
   * proper), some of the timing on the dispatches doesn't work and you
   * end up getting back into the site momentarily without credentials.
   */
  return (
    <StyledDiv>
      <div className="pageBackground"></div>
      <video id={"background-video"} autoPlay={true} muted={true} loop={true} className={"backgroundVideo"}>
        <source src={backgroundVideo} type="video/webm" />
      </video>
      <Typography className="headerText">LOGGED OUT</Typography>
      <div>
        <a className={"loginButton"} href={"/login"}>
          LOG IN
        </a>
      </div>
    </StyledDiv>
  );
};
