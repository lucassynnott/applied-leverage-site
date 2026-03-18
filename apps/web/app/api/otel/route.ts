import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

const TYPESENSE_URL = process.env.TYPESENSE_URL || "http://localhost:8108";
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || "";
const COLLECTION = "otel_events";

const HEADERS = { "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY };

type TypesenseHit = {
  document: {
    id: string;
    timestamp: number;
    level?: string;
    source?: string;
    component?: string;
    action?: string;
    error?: string;
    metadata_json?: string;
  };
};

type TypesenseFacet = {
  field_name?: string;
  counts?: Array<{ value?: string; count?: number }>;
};

type TypesenseSearchResponse = {
  found?: number;
  hits?: TypesenseHit[];
  facet_counts?: TypesenseFacet[];
};

function timestampFilter(hours: number): string {
  const cutoff = Math.floor((Date.now() - hours * 3600_000) / 1000) * 1000;
  return `timestamp:>=${cutoff}`;
}

async function handleListSearch(request: NextRequest): Promise<NextResponse> {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q") || "*";
  const limit = sp.get("limit") || "50";
  const page = sp.get("page") || "1";
  const hours = parseFloat(sp.get("hours") || "24");
  const level = sp.get("level");
  const source = sp.get("source");

  const filterParts: string[] = [timestampFilter(hours)];
  if (level) {
    const levels = level.split(",").map((l) => l.trim()).filter(Boolean);
    if (levels.length === 1) {
      filterParts.push(`level:=${levels[0]}`);
    } else if (levels.length > 1) {
      filterParts.push(`level:[${levels.join(",")}]`);
    }
  }
  if (source) {
    filterParts.push(`source:=${source}`);
  }

  const params = new URLSearchParams({
    q,
    query_by: "action,error,component,source,metadata_json,search_text",
    sort_by: "timestamp:desc",
    per_page: limit,
    page,
    filter_by: filterParts.join(" && "),
    facet_by: "source",
    exclude_fields: "search_text",
  });

  const resp = await fetch(
    `${TYPESENSE_URL}/collections/${COLLECTION}/documents/search?${params}`,
    { headers: HEADERS }
  );
  if (!resp.ok) {
    return NextResponse.json({ error: "Search failed" }, { status: resp.status });
  }

  const data = (await resp.json()) as TypesenseSearchResponse;
  const hits = (data.hits ?? []).map((h) => h.document);
  const facets = data.facet_counts ?? [];

  return NextResponse.json({ hits, facets });
}

async function handleStats(request: NextRequest): Promise<NextResponse> {
  const sp = request.nextUrl.searchParams;
  const hours = parseFloat(sp.get("hours") || "24");

  // Full window query
  const windowParams = new URLSearchParams({
    q: "*",
    query_by: "action",
    filter_by: timestampFilter(hours),
    per_page: "0",
    facet_by: "level",
  });

  // Recent 15-minute window
  const recent15mFilter = timestampFilter(0.25);
  const recentParams = new URLSearchParams({
    q: "*",
    query_by: "action",
    filter_by: recent15mFilter,
    per_page: "0",
    facet_by: "level",
  });

  const [windowResp, recentResp] = await Promise.all([
    fetch(`${TYPESENSE_URL}/collections/${COLLECTION}/documents/search?${windowParams}`, {
      headers: HEADERS,
    }),
    fetch(`${TYPESENSE_URL}/collections/${COLLECTION}/documents/search?${recentParams}`, {
      headers: HEADERS,
    }),
  ]);

  if (!windowResp.ok || !recentResp.ok) {
    return NextResponse.json({ error: "Stats query failed" }, { status: 503 });
  }

  const windowData = (await windowResp.json()) as TypesenseSearchResponse;
  const recentData = (await recentResp.json()) as TypesenseSearchResponse;

  function extractStats(data: TypesenseSearchResponse) {
    const total = data.found ?? 0;
    const levelFacet = (data.facet_counts ?? []).find((f) => f.field_name === "level");
    const errorCount =
      (levelFacet?.counts ?? [])
        .filter((c) => c.value === "error" || c.value === "fatal")
        .reduce((sum, c) => sum + (c.count ?? 0), 0);
    const errorRate = total > 0 ? errorCount / total : 0;
    return { total, errors: errorCount, errorRate };
  }

  const windowStats = extractStats(windowData);
  const recentStats = extractStats(recentData);

  return NextResponse.json({
    ...windowStats,
    windowHours: hours,
    recent15m: recentStats,
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authed = await isAuthenticated().catch(() => false);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get("mode") || "list";

  try {
    if (mode === "stats") {
      return await handleStats(request);
    }
    return await handleListSearch(request);
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
