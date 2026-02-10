import { env } from "./shared/config/env";
import app from "./app";

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
