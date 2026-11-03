import * as DateIso from "modules/core/date-iso";

import { QueryResolvers } from "../types.gen";

const queryResolvers: QueryResolvers = {
  localDate: async function (parent, args, context, info) {
    parent;
    args;
    context;
    info;
    return DateIso.toIsoDate(new Date());
  },
};

export default queryResolvers;
