import * as db from "db";
import * as os from "os";

const run = async () => {
  if (process.env.NODE_ENV !== "test") {
    console.info("Refusing to drop non-test db");
    return;
  }

  const knex = db.getConnection();
  const NUM_TEST_DBS = process.env.CI ? 6 : os.cpus().length;

  const before = new Date().getTime();
  for (var i = 1; i <= NUM_TEST_DBS; i++) {
    const name = `test-${i}-memorymap`;
    await knex.raw(/*sql*/ `drop database if exists "${name}"`);
  }
  const after = new Date().getTime();

  const elapsed = after - before;
  console.info(`dropped ${NUM_TEST_DBS} test DBs in ${elapsed} ms.`);

  await db.destroyAllConnections();
};

void run();
