import { prisma, selectSearchResults as select } from "@repo/database";
import type { SearchResultRow } from "@repo/database";
import "server-only";

export async function getSearchResults(symbol: string) {
  if (symbol === "") return [];

  const data = await prisma.token.findMany({
    where: {
      bondingCurve: { isNot: null },
      metadata: { symbol: { contains: symbol, mode: "insensitive" } },
    },
    orderBy: {
      createdAt: "asc",
    },
    select,
  });

  return data.map(toSearchResult);
}

function toSearchResult(search: SearchResultRow) {
  if (!search.metadata) {
    throw new Error("Missing required relations");
  }

  return {
    id: search.id,
    metadata: {
      ...search.metadata,
      thumbhash: Buffer.from(search.metadata.thumbhash).toString("base64"),
    },
  };
}

export type SearchResult = ReturnType<typeof toSearchResult>;
