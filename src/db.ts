import "dotenv/config";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://bookshelf:bookshelf@localhost:5432/bookshelf";

export const pool = new Pool({ connectionString });

pool.on("error", (err) => {
  console.error("Erro inesperado no pool do Postgres:", err.message);
});
