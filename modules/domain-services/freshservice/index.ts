import * as Hexagonal from "atomic-object/hexagonal";
import { FreshservicePort } from "./port";
import { createServiceRequest, FreshserviceServiceRequest, getGTMCatalogId } from "./freshservice";
import { FreshserviceCatalogOptions, UserIdWhereInput } from "graphql-api/server-types.gen";

export type Freshservice = {
  createServiceRequest: (
    catalogId: number,
    where: UserIdWhereInput,
    fields: { [k: string]: any }
  ) => Promise<FreshserviceServiceRequest | undefined>;

  getGTMCatalogId: (catalog: FreshserviceCatalogOptions) => number | undefined;
};

export const freshserviceAdapter = Hexagonal.adapter({
  port: FreshservicePort,
  requires: [],
  build: () => {
    return {
      createServiceRequest: async (catalogId: number, where: UserIdWhereInput, fields: { [k: string]: any }) => {
        return await createServiceRequest(catalogId, where, fields);
      },

      getGTMCatalogId: (catalog: FreshserviceCatalogOptions) => {
        return getGTMCatalogId(catalog);
      },
    };
  },
});
