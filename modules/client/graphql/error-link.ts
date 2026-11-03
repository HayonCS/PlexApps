import { History } from "history";
import { onError } from "@apollo/client/link/error";

import { ApolloLink } from "@apollo/client";
// import { AnyAction, Store } from "@reduxjs/toolkit";
// import { Actions } from "client/redux/actions";

export function buildErrorLink(
  history: History
  // store: Store<any, AnyAction>
): ApolloLink {
  history;
  return onError(({ graphQLErrors, networkError }) => {
    if (networkError) {
      if ((networkError as any).statusCode === 401) {
        //TODO: We may not want to redirect to local login forever.
        window.location.assign("/login");
      } else {
        // history.push("/error");
        // store.dispatch(
        //   Actions.Editor.notificationReceived({
        //     message: `${networkError.name}: ${networkError.message}`,
        //     type: "error",
        //   })
        // );
        // store.dispatch(Actions.Editor.setLockNetworkError(true));
      }
      return;
    }

    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.info(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      });
      // history.push("/error");
    }
  });
}
