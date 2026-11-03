import * as React from "react";
import { Avatar, styled, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import { CurrentUserDisplayPopper } from "./CurrentUserDisplayPopper";
import { useDebouncedCallback } from "use-debounce";
import { useGetEmployeePicture } from "modules/client/hooks/useGetEmployeePicture";
import { useGetActiveDirectoryUser } from "modules/client/hooks/useGetActiveDirectoryUser";

const StyledDisplayContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  textWrap: "nowrap",
  ".skeletonRoot": {
    display: "flex",
  },
  ".skeletonPicture": {
    marginLeft: "8px",
    marginRight: "8px",
    width: "50px",
    height: "50px",
    backgroundColor: theme.vars?.palette.Skeleton.bg,
  },
  ".skeletonName": {
    width: "100px",
    height: "30px",
    backgroundColor: theme.vars?.palette.Skeleton.bg,
  },
  ".userPicture": {
    marginLeft: "8px",
    marginRight: "8px",
  },
  ".userName": {
    fontSize: theme.typography.h3.fontSize,
    fontFamily: theme.typography.fontFamily,
    width: "100%",
  },
}));

type CurrentUserInformation = {
  fullName: string;
  phoneNumber: string;
  building: string;
  emailAddress: string;
  employeeNumber: number;
};

export const CurrentUserDisplay: React.FC<{
  userName: string;
  avatarOnly?: boolean;
  slimPopperDisplay?: boolean;
  readOnly?: boolean;
  className?: string;
}> = (props) => {
  const activeDirectoryUser = useGetActiveDirectoryUser(props.userName);

  const [open, setOpen] = React.useState<boolean>(false);
  const [isMouseOver, setMouseOver] = React.useState<boolean>(false);

  const [currentUser, setCurrentUser] = React.useState<CurrentUserInformation>({
    fullName: "undefined undefined",
    phoneNumber: "undefined",
    building: "undefined",
    emailAddress: "undefined",
    employeeNumber: -1,
  });

  const userPicture = useGetEmployeePicture(
    typeof currentUser.employeeNumber === "number" ? currentUser.employeeNumber : -1
  );

  React.useEffect(() => {
    if (activeDirectoryUser !== "ERROR" && activeDirectoryUser !== "LOADING") {
      if (activeDirectoryUser) {
        setCurrentUser({
          fullName: `${activeDirectoryUser.givenName} ${activeDirectoryUser.surname}`,
          phoneNumber: activeDirectoryUser.mobilePhone,
          building: activeDirectoryUser.department,
          emailAddress: activeDirectoryUser.email,
          employeeNumber: parseInt(activeDirectoryUser.employeeId),
        });
      }
    } else {
      setCurrentUser({
        fullName: "undefined undefined",
        phoneNumber: "undefined",
        building: "undefined",
        emailAddress: "undefined@gentex.com",
        employeeNumber: -1,
      });
    }
  }, [activeDirectoryUser]);

  const HandlePopperState = useDebouncedCallback(() => {
    if (isMouseOver) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, 300);

  return "LOADING" === userPicture || "LOADING" === activeDirectoryUser ? (
    <StyledDisplayContainer className={"skeletonRoot"} data-testid={"current-user-display-skeletons"}>
      <Skeleton className={"skeletonPicture"} variant="circular" />
      <Skeleton className={"skeletonName"} variant="text" />
    </StyledDisplayContainer>
  ) : "ERROR" === userPicture || "" === userPicture ? (
    <StyledDisplayContainer
      id={`current-user-display-${props.userName}`}
      data-testid={"current-user-display"}
      className={`${props.className ? props.className : ""}`}
      onMouseEnter={() => {
        setMouseOver(true);
        HandlePopperState();
      }}
      onMouseLeave={() => {
        setMouseOver(false);
        HandlePopperState();
      }}
    >
      <Avatar data-testid={"user-avatar"} className={`userPicture`}>
        ${props.userName[0]}
      </Avatar>
      {!props.avatarOnly && (
        <Typography data-testid={"name-text"} className="userName">
          {currentUser.fullName.toLocaleUpperCase()}
        </Typography>
      )}
      <CurrentUserDisplayPopper
        setMouseOver={(isOver: boolean) => {
          setMouseOver(isOver);
          HandlePopperState();
        }}
        userName={props.userName}
        fullName={currentUser.fullName}
        location={currentUser.building}
        phoneNumber={currentUser.phoneNumber}
        emailAddress={currentUser.emailAddress}
        employeeNumber={currentUser.employeeNumber}
        userPicture={userPicture}
        readOnly={props.readOnly}
        open={open}
        slimDisplay={props.slimPopperDisplay ?? props.slimPopperDisplay}
      />
    </StyledDisplayContainer>
  ) : (
    <StyledDisplayContainer
      id={`current-user-display-${props.userName}`}
      data-testid={"current-user-display"}
      className={`${props.className ? props.className : ""}`}
      onMouseEnter={() => {
        setMouseOver(true);
        HandlePopperState();
      }}
      onMouseLeave={() => {
        setMouseOver(false);
        HandlePopperState();
      }}
    >
      <Avatar data-testid={"user-avatar"} className={`userPicture`} src={userPicture ? userPicture : ""} />
      {!props.avatarOnly && (
        <Typography data-testid={"name-text"} className="userName">
          {currentUser.fullName.toLocaleUpperCase()}
        </Typography>
      )}
      <CurrentUserDisplayPopper
        setMouseOver={(isOver: boolean) => {
          setMouseOver(isOver);
          HandlePopperState();
        }}
        userName={props.userName}
        fullName={currentUser.fullName}
        location={currentUser.building}
        phoneNumber={currentUser.phoneNumber}
        emailAddress={currentUser.emailAddress}
        employeeNumber={currentUser.employeeNumber}
        readOnly={props.readOnly}
        userPicture={userPicture}
        open={open}
        slimDisplay={props.slimPopperDisplay ?? props.slimPopperDisplay}
      />
    </StyledDisplayContainer>
  );
};
