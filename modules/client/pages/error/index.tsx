import { styled, Typography } from "@mui/material";
import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import backgroundVideo from "modules/client/videos/background-video.webm";

const StyledDiv = styled("div")(({ theme }) => ({
  height: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ".contentContainer": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    transform: "translate(0, -10%)",
  },
  ".titleText": {
    color: "white",
    fontFamily: "Orbitron",
    fontSize: "150px",
    display: "flex",
  },
  ".errorText": {
    fontFamily: theme.typography.fontFamily,
    fontSize: "2em",
    color: "white",
  },
  ".backgroundVideo": {
    height: "100%",
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translate(-50%, 0)",
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
}));

const ErrorRoute: React.FC<{}> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = React.useState<number>(5);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        clearInterval(interval);
        if (location.state) {
          navigate(-2);
        } else {
          navigate(-1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, seconds, location.state]);

  return location.state ? (
    <StyledDiv>
      <div className="pageBackground">
        <div className={"contentContainer"}>
          <Typography className={"titleText"}>OpsManager</Typography>
          <Typography className={"errorText"}>
            {`${location.state.error}  Navigating to the previous page in ${seconds}...`}
          </Typography>
        </div>

        <video id={"background-video"} autoPlay={true} muted={true} loop={true} className={"backgroundVideo"}>
          <source src={backgroundVideo} type="video/webm" />
        </video>
      </div>
    </StyledDiv>
  ) : (
    <StyledDiv>
      <div className="pageBackground">
        <div className={"contentContainer"}>
          <Typography className={"titleText"}>OpsManager</Typography>
          <Typography className={"errorText"}>
            The requested page does not exist. Navigating to the previous page in {seconds}...
          </Typography>
        </div>

        <video id={"background-video"} autoPlay={true} muted={true} loop={true} className={"backgroundVideo"}>
          <source src={backgroundVideo} type="video/webm" />
        </video>
      </div>
    </StyledDiv>
  );
};

export default ErrorRoute;
