import { BOOK_STATUSES, BookInput, BookStatus, BookUpdate } from "./types";

type Result<T> = { ok: true; data: T } | { ok: false; errors: string[] };

function isStatus(value: unknown): value is BookStatus {
  return typeof value === "string" && (BOOK_STATUSES as readonly string[]).includes(value);
}

function validateFields(body: Record<string, unknown>, partial: boolean) {
  const errors: string[] = [];
  const data: BookUpdate = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== "string" || body.title.trim() === "" || body.title.length > 200) {
      errors.push("title é obrigatório (texto de até 200 caracteres)");
    } else {
      data.title = body.title.trim();
    }
  }

  if (body.author !== undefined || !partial) {
    if (typeof body.author !== "string" || body.author.trim() === "" || body.author.length > 120) {
      errors.push("author é obrigatório (texto de até 120 caracteres)");
    } else {
      data.author = body.author.trim();
    }
  }

  if (body.pages !== undefined) {
    if (body.pages === null) {
      data.pages = null;
    } else if (!Number.isInteger(body.pages) || (body.pages as number) <= 0) {
      errors.push("pages deve ser um inteiro positivo");
    } else {
      data.pages = body.pages as number;
    }
  }

  if (body.status !== undefined) {
    if (!isStatus(body.status)) {
      errors.push(`status deve ser um de: ${BOOK_STATUSES.join(", ")}`);
    } else {
      data.status = body.status;
    }
  }

  if (body.rating !== undefined) {
    if (body.rating === null) {
      data.rating = null;
    } else if (!Number.isInteger(body.rating) || (body.rating as number) < 1 || (body.rating as number) > 5) {
      errors.push("rating deve ser um inteiro entre 1 e 5");
    } else {
      data.rating = body.rating as number;
    }
  }

  if (body.cover_url !== undefined) {
    if (body.cover_url === null) {
      data.cover_url = null;
    } else if (
      typeof body.cover_url !== "string" ||
      body.cover_url.length > 500 ||
      !body.cover_url.startsWith("https://covers.openlibrary.org/")
    ) {
      errors.push("cover_url deve ser uma URL de capa da Open Library");
    } else {
      data.cover_url = body.cover_url;
    }
  }

  return { errors, data };
}

export function validateCreate(body: unknown): Result<BookInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: ["corpo da requisição inválido"] };
  }
  const { errors, data } = validateFields(body as Record<string, unknown>, false);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: data as BookInput };
}

export function validateUpdate(body: unknown): Result<BookUpdate> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: ["corpo da requisição inválido"] };
  }
  const { errors, data } = validateFields(body as Record<string, unknown>, true);
  if (errors.length === 0 && Object.keys(data).length === 0) {
    errors.push("envie ao menos um campo para atualizar");
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data };
}
