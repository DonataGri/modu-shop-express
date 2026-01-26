import express, { type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

app.get("health", (_: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
