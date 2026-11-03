import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { App } from "./modules/client";
import { buildGraphqlClient } from "./modules/client/graphql/client";
import { createBrowserHistory } from "history";
import { store } from "./modules/client/redux/store";
import { Provider } from "react-redux";
import { CssBaseline, InitColorSchemeScript, ThemeProvider } from "@mui/material";
import { AppTheme } from "./modules/client/styles/mui-theme";
import { checkAuthStatus } from "./modules/client/redux/actions/thunks/authentication-thunks";
import { LicenseInfo } from "@mui/x-license";

const history = createBrowserHistory();

const bootstrapClient = () => {
  const dataGridLicense = `${process.env.DATA_GRID_LICENSE_KEY ?? ""}`;
  LicenseInfo.setLicenseKey(dataGridLicense);

  window.onerror = (message, filename?, lineno?, colno?, error?) => {
    console.error("OnError: ", message, error);
  };

  window.onunhandledrejection = (event: any) => {
    const error = event.reason;
    console.error("OnUnhandledRejection: ", error);
  };

  const graphqlClient = buildGraphqlClient(store, history);
  void store.dispatch(checkAuthStatus());

  const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);

  root.render(
    <ApolloProvider client={graphqlClient}>
      <InitColorSchemeScript defaultMode={"dark"} attribute="class" />
      <ThemeProvider theme={AppTheme} defaultMode={"dark"} noSsr={true}>
        <CssBaseline />
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

bootstrapClient();
