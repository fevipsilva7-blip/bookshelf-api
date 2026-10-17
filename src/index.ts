import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { pool } from "./db";
import { booksRouter } from "./routes/books";
import { searchRouter } from "./routes/search";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "up" });
  } catch {
    res.status(503).json({ status: "error", database: "down" });
  }
});

app.use("/books", booksRouter);
app.use("/search", searchRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ errors: ["rota não encontrada"] });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ errors: ["erro interno do servidor"] });
});

app.listen(PORT, () => {
  console.log(`Bookshelf API rodando em http://localhost:${PORT}`);
});
