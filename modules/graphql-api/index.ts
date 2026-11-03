export type { SchemaMap } from "./schema-base";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { default as resolversInternal } from "./resolvers";

import { rawSchema } from "./schema-base";

export const typeDefs = rawSchema;
export const resolvers = resolversInternal;

export const executableSchema = makeExecutableSchema({ typeDefs: typeDefs, resolvers: resolvers as any });
