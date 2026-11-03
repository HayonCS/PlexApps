import queryResolvers from "modules/graphql-api/resolvers/query";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolverNames = Object.keys(queryResolvers);

const directoryPath = path.join(__dirname, "/../../modules/graphql-api/__tests__/");
const resolverTestFileNames = fs.readdirSync(directoryPath);

const missingResolverTests = resolverNames.map((resolverName) => {
  if (
    !resolverTestFileNames.includes(`${resolverName}.test.ts`) &&
    !resolverTestFileNames.includes(`${resolverName}.spec.ts`)
  ) {
    return resolverName;
  }
});

const missingResolverTestsFiltered = missingResolverTests.filter((v) => v !== undefined);

if (missingResolverTestsFiltered.length > 0) {
  console.error(
    `🟡🟡🟡 WARNING: Missing unit tests for the following graphql resolvers: \n`,
    missingResolverTests.filter((v) => v !== undefined)
  );
}
