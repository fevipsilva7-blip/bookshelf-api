export interface SearchResult {
  key: string;
  title: string;
  author: string;
  pages: number | null;
  year: number | null;
  coverUrl: string | null;
}

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  number_of_pages_median?: number;
  first_publish_year?: number;
  cover_i?: number;
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

const SEARCH_URL = "https://openlibrary.org/search.json";
const FIELDS = "key,title,author_name,number_of_pages_median,first_publish_year,cover_i";

export class UpstreamError extends Error {}

export async function searchBooks(query: string, limit = 10): Promise<SearchResult[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", FIELDS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": "bookshelf-api (projeto de estudo)" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new UpstreamError("não foi possível consultar a Open Library");
  }

  if (!response.ok) {
    throw new UpstreamError(`Open Library respondeu com status ${response.status}`);
  }

  const data = (await response.json()) as OpenLibraryResponse;

  return (data.docs ?? [])
    .filter((doc): doc is OpenLibraryDoc & { key: string; title: string } =>
      Boolean(doc.key && doc.title)
    )
    .map((doc) => ({
      key: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] ?? "Autor desconhecido",
      pages: doc.number_of_pages_median ?? null,
      year: doc.first_publish_year ?? null,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
    }));
}
