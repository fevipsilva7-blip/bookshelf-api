import { Router, Request, Response } from "express";
import { searchBooks, UpstreamError } from "../openLibrary";

export const searchRouter = Router();

// GET /search?q=tolkien
searchRouter.get("/", async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2) {
    return res.status(400).json({ errors: ["q deve ter ao menos 2 caracteres"] });
  }

  try {
    const results = await searchBooks(q);
    res.json(results);
  } catch (err) {
    if (err instanceof UpstreamError) {
      return res.status(502).json({ errors: [err.message] });
    }
    throw err;
  }
});
