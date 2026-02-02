import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { productRoutes } from "./container";

const app = express();

app.use(express.json());

app.use("/products", productRoutes);

app.use((err, req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal service error";

  console.error(err); // for devs

  res.status(status).json({
    message,
  });
});

app.get("/", (_: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

app.get("health", (_: Request, res: Response) => {
  res.json({ status: "OK" });
});

export default app;
