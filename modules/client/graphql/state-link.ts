import { Query as ClientSideQuery } from "./types.gen";

import { Query as ServerSideQuery } from "graphql-api/server-types.gen";
import * as DateIso from "modules/core/date-iso";
type ClientSideProps = Exclude<keyof ClientSideQuery, keyof ServerSideQuery>;

export type ClientState = Pick<ClientSideQuery, ClientSideProps>;

export const DEFAULTS: ClientState = {
  localDate: DateIso.toIsoDate(new Date()),
};
