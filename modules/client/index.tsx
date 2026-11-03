import * as React from "react";
import { createBrowserRouter, Navigate, Outlet, redirect, RouterProvider, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dashboard } from "client/pages/dashboard";
import { AuthenticationSelectors } from "./redux/slices/authentication-slice";
import { Login } from "client/pages/login";
import { LogOut } from "client/pages/logout";
import { Settings } from "./components/user-settings/Settings";
import { Editor } from "./components/editor/Editor";
import { Health, Metrics } from "client/pages/health";
import ErrorRoute from "./pages/error";
import { useGetUserSettingsQuery } from "./graphql/types.gen";
import { Actions } from "./redux/actions";
import { useColorScheme } from "@mui/material";
import { UserSettingsSelectors } from "./redux/slices/user-settings-slice";
import { NotificationsProvider } from "@toolpad/core";
import { NavigationDrawer } from "./components/common/navigation/NavigationDrawer";
import AppBar from "./components/common/app-bar/AppBar";
import "allotment/dist/style.css";

export function App() {
  const isAuthenticated = useSelector(AuthenticationSelectors.isNotUnauthenticated);
  const currentUserName = useSelector(AuthenticationSelectors.currentUserName);
  const darkMode = useSelector(UserSettingsSelectors.darkMode);
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    if (darkMode) {
      colorScheme.setMode("dark");
    } else {
      colorScheme.setMode("light");
    }
  }, [colorScheme, darkMode]);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/logout",
      element: <LogOut />,
    },
    {
      element: <ProtectedRoute authenticated={isAuthenticated} />,
      children: [
        {
          element: <WithUserSettingsLoaded userName={currentUserName} />,
          children: [
            {
              element: (
                <>
                  <Settings />
                  <Outlet />
                </>
              ),
              children: [
                {
                  path: "*",
                  element: <ErrorRoute />,
                },
                {
                  path: "/",
                  loader: () => {
                    return redirect("/dashboard");
                  },
                },
                {
                  path: "/dashboard",
                  element: <Dashboard />,
                },
                {
                  path: "/health",
                  element: <Health />,
                },
                {
                  path: "/metrics",
                  element: <Metrics />,
                },
                {
                  path: "/:memoryMapName/:bomRevision/:version/",
                  element: <Editor />,
                },
                {
                  path: "/:memoryMapName/:bomRevision/:version/:commandName/",
                  element: <Editor />,
                },
                {
                  path: "/:memoryMapName/:bomRevision/:version/:commandName/:parameterName",
                  element: <Editor />,
                },
              ],
            },
          ],
        },
      ],
      errorElement: <ErrorRoute />,
    },
  ]);

  return <RouterProvider router={router} />;
}

const WithUserSettingsLoaded: React.FC<{ userName: string }> = (props) => {
  const dispatch = useDispatch();

  const { data, loading, error } = useGetUserSettingsQuery({
    variables: {
      userName: props.userName,
    },
    skip: props.userName === "unknown",
  });

  React.useEffect(() => {
    if (!loading && !error) {
      if (data && data.getUserSettings) {
        dispatch(Actions.UserSettingsActions.settingsLoaded({ settings: data.getUserSettings }));
      }
    }
  }, [data, dispatch, error, loading]);

  return <Outlet />;
};

const ProtectedRoute: React.FC<{ authenticated: boolean }> = (props) => {
  const location = useLocation();

  if (!props.authenticated) {
    return <Navigate to={"/login"} replace={true} state={{ from: location }} />;
  } else {
    return (
      <NotificationsProvider slotProps={{ snackbar: { anchorOrigin: { vertical: "bottom", horizontal: "center" } } }}>
        <AppBar />
        <NavigationDrawer />
        <Outlet />
      </NotificationsProvider>
    );
  }
};
