import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
  type ErrorRequestHandler,
} from "express";
import morgan from "morgan";
import { authRoute, storeRoute } from "./container";
import { authenticate } from "./shared/utils/middlewares/authenticate";
import { logger } from "./shared/logger";

const app = express();

app.use(express.json());
app.use(morgan("tiny"));

app.use("/auth", authRoute);
app.use("/stores", authenticate(), storeRoute);

app.get("/", (_: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "OK" });
});

const errorHandler: ErrorRequestHandler = (
  err,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal service error";

  logger.error(err);

  res.status(status).json({
    message,
  });
};

app.use(errorHandler);

export default app;
