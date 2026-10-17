import fs from "node:fs";
import path from "node:path";
import { pool } from "./db";

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf-8");
  await pool.query(sql);
  console.log("Schema aplicado com sucesso.");
  await pool.end();
}

main().catch((err) => {
  console.error("Falha ao aplicar o schema:", err.message);
  process.exit(1);
});
