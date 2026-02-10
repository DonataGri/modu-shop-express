import { env } from "./shared/config/env";
import app from "./app";
import { logger } from "./shared/logger";

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT} 🚀`);
});
