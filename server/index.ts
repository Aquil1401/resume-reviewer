import "dotenv/config";
import { createApp } from "./app";

const log = console.log;

(async () => {
  const app = await createApp();
  const port = parseInt(process.env.PORT || "5000", 10);

  app.listen(port, "0.0.0.0", () => {
    log(`express server serving on port ${port}`);
  });
})();
