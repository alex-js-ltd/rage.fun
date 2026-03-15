import type { Prisma, TokenFeedRow } from "@repo/database";
import type { SearchParams } from "@/app/utils/schemas";

import { prisma, selectTokenFeed as select } from "@repo/database";
import { getSolPrice } from "@/app/data/get_sol_price";
import { calculatePercentage, solToUsd } from "@/app/utils/misc";
import Decimal from "decimal.js";
import "server-only";

// Number of items we want to return per page
const TAKE = 12;

export async function getTokenFeed(searchParams: SearchParams) {
  const { sortType, sortOrder, cursorId, creatorId } = searchParams;

  /**
   * Cursor pagination strategy:
   *
   * 1. Fetch TAKE + 1 records
   *    The extra record lets us detect if there is another page.
   *
   * 2. If a cursor exists, we skip the cursor row itself
   *    because Prisma includes the cursor row by default.
   *
   * 3. The cursor tells Prisma where the page should start.
   */
  const tokens = await prisma.token.findMany({
    where: getWhere({ sortType, sortOrder, creatorId }),

    // Select only the fields needed for the feed
    select,

    // Fetch one extra record to detect "hasMore"
    take: TAKE + 1,

    /**
     * When a cursor is present Prisma will include the cursor row.
     * We skip it so the next page doesn't repeat the last item
     * from the previous page.
     */
    skip: cursorId ? 1 : 0,

    /**
     * Cursor tells Prisma where the page should start.
     * Example:
     * cursor = { id: "abc" }
     *
     * means "start the page from this row"
     */
    cursor: getCursor(cursorId),

    /**
     * Cursor pagination REQUIRES deterministic ordering.
     *
     * If two rows have the same value (ex: same createdAt),
     * we add `id` as a tiebreaker so the order is stable.
     */
    orderBy: [...getOrderBy({ sortType, sortOrder })],
  });

  const solPrice = await getSolPrice();

  const data = tokens.map((item) => toTokenCard(item, solPrice));

  /**
   * Because we fetched TAKE + 1 rows we can check if
   * more rows exist after this page.
   */
  const hasMore = data.length > TAKE;

  /**
   * If we fetched an extra row we remove it before
   * returning results to the client.
   */
  const section = hasMore ? data.slice(0, TAKE) : data;

  return {
    tokens: section,

    // If we didn't fetch an extra row, we reached the final page
    isLastPage: !hasMore,

    searchParams,

    /**
     * The next cursor is the id of the LAST item in the page.
     *
     * The next request will pass this id back and Prisma
     * will continue the query from this row.
     */
    nextCursorId: hasMore ? section[section.length - 1].id : undefined,

    creatorId,
  };
}

/**
 * Builds the WHERE clause dynamically depending on the
 * filter options in searchParams.
 */
function getWhere({
  sortType,
  creatorId,
}: SearchParams & { creatorId?: string }) {
  const base = {
    bondingCurve: { isNot: null },

    // Optional filter by creator
    ...(creatorId ? { creatorId: { equals: creatorId } } : {}),
  } satisfies Prisma.TokenWhereInput;

  switch (sortType) {
    case "lastTrade":
      return {
        ...base,

        // Only tokens that actually have trades
        swapEvents: { some: {} },
      } satisfies Prisma.TokenWhereInput;

    case "createdAt":
    case "volume":
    case "marketCap":
      return base;

    default:
      throw new Error(`Unsupported sortType: ${sortType}`);
  }
}

/**
 * Converts a cursorId into a Prisma cursor object.
 *
 * Prisma requires a unique field for cursor pagination.
 * Here we use the token id.
 */
function getCursor(
  cursorId: SearchParams["cursorId"],
): Prisma.TokenFindManyArgs["cursor"] {
  return cursorId ? { id: cursorId } : undefined;
}

/**
 * Builds a stable ordering for cursor pagination.
 *
 * The important rule:
 * cursor pagination MUST have deterministic ordering.
 *
 * We always include `id` as a secondary sort key so
 * rows with identical timestamps don't break pagination.
 */
function getOrderBy({
  sortType,
  sortOrder,
}: SearchParams): Prisma.TokenOrderByWithRelationInput[] {
  const base = [
    { createdAt: sortOrder },
    { id: sortOrder },
  ] satisfies Prisma.TokenOrderByWithRelationInput[];

  switch (sortType) {
    case "createdAt":
      return [...base];

    case "lastTrade":
      return [{ bondingCurve: { updatedAt: sortOrder } }, ...base];

    case "volume":
      return [{ marketData: { volume: sortOrder } }, ...base];

    case "marketCap":
      return [
        { marketData: { marketCap: sortOrder } },
        { marketData: { liquidity: sortOrder } },
        ...base,
      ];

    default:
      throw new Error(`Unsupported sortType: ${sortType}`);
  }
}

function getMetadata(metadata: NonNullable<TokenFeedRow["metadata"]>) {
  return {
    ...metadata,
    thumbhash: Buffer.from(metadata.thumbhash).toString("base64"),
  };
}

function getBondingCurve(
  bondingCurve: NonNullable<TokenFeedRow["bondingCurve"]>,
  solPrice: number,
) {
  return {
    updatedAt: bondingCurve.updatedAt.toISOString(),
    tradingFees: solToUsd(
      new Decimal(bondingCurve.tradingFees).div(1e9),
      solPrice,
    ).toNumber(),
    progress: calculatePercentage(
      bondingCurve.currentReserve,
      bondingCurve.targetReserve,
    ),
  };
}

function getMarketData(
  marketData: NonNullable<TokenFeedRow["marketData"]>,
  solPrice: number,
) {
  const price = solToUsd(marketData.price, solPrice).toNumber();
  const marketCap = solToUsd(marketData.marketCap, solPrice).toNumber();
  const liquidityInSol = new Decimal(marketData.liquidity).div(1e9);
  const volumeInSol = new Decimal(marketData.volume).div(1e9);
  const liquidity = solToUsd(liquidityInSol, solPrice).toNumber();
  const volume = solToUsd(volumeInSol, solPrice).toNumber();

  return {
    price,
    marketCap,
    liquidity,
    volume,
    buyCount: marketData.buyCount,
    sellCount: marketData.sellCount,
  };
}

function toTokenCard(token: TokenFeedRow, solPrice: number) {
  if (!token.metadata || !token.bondingCurve || !token.marketData) {
    throw new Error("Missing required relations");
  }

  return {
    id: token.id,
    creatorId: token.creatorId,
    metadata: getMetadata(token.metadata),
    bondingCurve: getBondingCurve(token.bondingCurve, solPrice),
    marketData: getMarketData(token.marketData, solPrice),
    updateType: undefined as UpdateType,
  };
}

type UpdateType = "Buy" | "Sell" | "Create" | "Harvest" | undefined;

export type TokenCard = ReturnType<typeof toTokenCard>;
