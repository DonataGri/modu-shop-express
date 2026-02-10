import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
  type ErrorRequestHandler,
} from "express";
import { authRoute, productRoutes } from "./container";
import { authenticate } from "./shared/utils/middlewares/authenticate";

const app = express();

app.use(express.json());

app.use("/products", authenticate(), productRoutes);
app.use("/auth", authRoute);

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

  console.error(err); // for devs

  res.status(status).json({
    message,
  });
};

app.use(errorHandler);

export default app;
