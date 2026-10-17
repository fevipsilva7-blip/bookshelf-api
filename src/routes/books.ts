import { Router, Request, Response } from "express";
import { pool } from "../db";
import { Book, BOOK_STATUSES } from "../types";
import { validateCreate, validateUpdate } from "../validation";

export const booksRouter = Router();

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /books?status=lendo&q=tolkien
booksRouter.get("/", async (req: Request, res: Response) => {
  const { status, q } = req.query;
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (typeof status === "string") {
    if (!(BOOK_STATUSES as readonly string[]).includes(status)) {
      return res.status(400).json({ errors: [`status deve ser um de: ${BOOK_STATUSES.join(", ")}`] });
    }
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (typeof q === "string" && q.trim() !== "") {
    values.push(`%${q.trim()}%`);
    conditions.push(`(title ILIKE $${values.length} OR author ILIKE $${values.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query<Book>(
    `SELECT * FROM books ${where} ORDER BY created_at DESC`,
    values
  );
  res.json(rows);
});

// GET /books/stats
booksRouter.get("/stats", async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'quero_ler')::int AS quero_ler,
       COUNT(*) FILTER (WHERE status = 'lendo')::int AS lendo,
       COUNT(*) FILTER (WHERE status = 'lido')::int AS lido,
       COALESCE(SUM(pages) FILTER (WHERE status = 'lido'), 0)::int AS paginas_lidas,
       ROUND(AVG(rating), 2)::float AS media_notas
     FROM books`
  );
  res.json(rows[0]);
});

// GET /books/:id
booksRouter.get("/:id", async (req: Request, res: Response) => {
  const id = parseId(req);
  if (id === null) return res.status(400).json({ errors: ["id inválido"] });

  const { rows } = await pool.query<Book>("SELECT * FROM books WHERE id = $1", [id]);
  if (rows.length === 0) return res.status(404).json({ errors: ["livro não encontrado"] });
  res.json(rows[0]);
});

// POST /books
booksRouter.post("/", async (req: Request, res: Response) => {
  const result = validateCreate(req.body);
  if (!result.ok) return res.status(400).json({ errors: result.errors });

  const {
    title,
    author,
    pages = null,
    status = "quero_ler",
    rating = null,
    cover_url = null,
  } = result.data;
  const { rows } = await pool.query<Book>(
    `INSERT INTO books (title, author, pages, status, rating, cover_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, author, pages, status, rating, cover_url]
  );
  res.status(201).json(rows[0]);
});

// PATCH /books/:id
booksRouter.patch("/:id", async (req: Request, res: Response) => {
  const id = parseId(req);
  if (id === null) return res.status(400).json({ errors: ["id inválido"] });

  const result = validateUpdate(req.body);
  if (!result.ok) return res.status(400).json({ errors: result.errors });

  const entries = Object.entries(result.data);
  const sets = entries.map(([column], i) => `${column} = $${i + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);

  const { rows } = await pool.query<Book>(
    `UPDATE books
     SET ${sets.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  if (rows.length === 0) return res.status(404).json({ errors: ["livro não encontrado"] });
  res.json(rows[0]);
});

// DELETE /books/:id
booksRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = parseId(req);
  if (id === null) return res.status(400).json({ errors: ["id inválido"] });

  const { rowCount } = await pool.query("DELETE FROM books WHERE id = $1", [id]);
  if (rowCount === 0) return res.status(404).json({ errors: ["livro não encontrado"] });
  res.status(204).send();
});
