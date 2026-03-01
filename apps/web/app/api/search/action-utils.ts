type NextAction = {
  command: string;
  description: string;
  params?: Record<string, { type: string; required?: boolean; description?: string }>;
};

type TopHit = {
  url: string;
  title: string;
};

export function buildSearchNextActions({
  origin,
  query,
  limit,
  topHit,
}: {
  origin: string;
  query: string;
  limit: number;
  topHit?: TopHit;
}): NextAction[] {
  return [
    ...(topHit ? [{
      command: `curl -sS "${origin}${topHit.url}"`,
      description: `Read top result: ${topHit.title}`,
    }] : []),
    {
      command: `curl -sS "${origin}/api/search?q=${encodeURIComponent(query)}&limit=${Math.min(limit + 10, 50)}"`,
      description: "Expand search (more results)",
    },
    {
      command: `curl -sS "${origin}/api/docs/search?q=${encodeURIComponent(query)}&perPage=5"`,
      description: "Search docs/books (chunked documents)",
    },
    {
      command: `curl -sS "${origin}/feed.xml"`,
      description: "RSS feed (all articles, full content)",
    },
  ];
}
