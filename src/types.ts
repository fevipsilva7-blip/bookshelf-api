export const BOOK_STATUSES = ["quero_ler", "lendo", "lido"] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export interface Book {
  id: number;
  title: string;
  author: string;
  pages: number | null;
  status: BookStatus;
  rating: number | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookInput {
  title: string;
  author: string;
  pages?: number | null;
  status?: BookStatus;
  rating?: number | null;
  cover_url?: string | null;
}

export type BookUpdate = Partial<BookInput>;
