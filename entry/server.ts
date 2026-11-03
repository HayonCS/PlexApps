import { startServer } from "modules/server";

startServer().catch((error) => {
  console.error("Failed to start server!", error.message);
});
