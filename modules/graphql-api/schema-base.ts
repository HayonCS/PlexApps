import { Mutation, Query } from "client/graphql/types.gen";
import { FreshserviceServiceRequest } from "modules/domain-services/freshservice/freshservice";

import schema from "modules/graphql-api/schema.graphql?raw";
export const rawSchema = schema;
/** Shape of high level schema types. Used to type check mock apollo client arguments */
export interface SchemaMap {
  Query: Query;
  Mutation: Mutation;
  FreshserviceServiceRequest: FreshserviceServiceRequest;
}
