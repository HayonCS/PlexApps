import { createRootReducer } from "client/redux/store";
import { configureStore } from "@reduxjs/toolkit";
import * as React from "react";
import { MemoryRouter } from "react-router";
import { ApolloProvider } from "@apollo/client";
import { Provider } from "react-redux";
import { buildGraphqlClient } from "../graphql/client";
import { createBrowserHistory } from "history";
import { OpsManagerUser } from "modules/helpers/user-information";
import { AppTheme } from "../styles/mui-theme";
import { ThemeProvider } from "@mui/material";

const history = createBrowserHistory();

const storybookStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: {
    Authentication: {
      type: "Authenticated",
      user: {
        department: "Test and Measurement",
        distinguishedName: "CN=Brasky, Bill,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
        emailAddress: "bill.brasky@gentex.com",
        employeeNumber: 69,
        firstName: "Bill",
        lastName: "Brasky",
        formattedName: "Brasky, Bill",
        gentexPhone: "+1 (616) 7721590 x2345",
        manager: "CN=Meyer, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
        mobilePhone: "9895684589",
        pager: "19992",
        principalName: "bill.brasky@gentex.com",
        sid: "S-1-5-21-56231545-804616388-477645130-30460",
        userName: "bill.brasky",
        readOnly: false,
        iat: 1730226972,
      } as OpsManagerUser,
    },
  },
});

const graphqlClient = buildGraphqlClient(storybookStore, history);

export const OpsManagerStorybookProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  return (
    <MemoryRouter>
      <ThemeProvider theme={AppTheme}>
        <ApolloProvider client={graphqlClient}>
          <Provider store={storybookStore}>{props.children}</Provider>
        </ApolloProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};
