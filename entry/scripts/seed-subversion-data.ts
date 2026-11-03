import { seedSubversionData } from "modules/helpers/subversion-seed";
import * as path from "path";

const run = async () => {
  if (process.env.NODE_ENV !== "development") {
    console.info("Refusing to seed outside of NODE_ENV=development");
    return;
  }

  await seedSubversionData(
    "gentex-repo",
    path.resolve(".", "entry", "scripts", "artifacts", "subversion", "commandsets")
  );
};

void run();
