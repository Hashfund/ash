import { desc, sql } from "drizzle-orm";

import { boundingCurves, mints, swaps } from "db/schema";
import { mapFilters, queryBuilder } from "utils/query";

import { getAllMint, getMintLeaderboard } from "./mint.controller";

export const mintQuery = queryBuilder({
  canTrade: mapFilters(mints.canTrade),
  creator: mapFilters(mints.creator),
});

export const orderMintsBy = (
  value: string | undefined,
  q: ReturnType<typeof getAllMint>
) => {
  switch (value) {
    case "timestamp":
      return q.orderBy(desc(mints.timestamp));
    case "volumeIn":
      return q.orderBy(desc(sql`volume_in`));
    case "price":
      return q.orderBy(desc(boundingCurves.initialPrice));
    case "maxMarketCap":
      return q.orderBy(desc(boundingCurves.maximumMarketCap));
    case "marketCap":
      return q.orderBy(desc(sql`market_cap`));
    default:
      return q;
  }
};

export const orderLeaderboardBy = (
  value: string | undefined,
  q: ReturnType<typeof getMintLeaderboard>
) => {
  switch (value) {
    case "volumeIn":
      return q.orderBy(desc(sql`volume_in`));
    case "volumeOut":
      return q.orderBy(desc(sql`volume_out`));
    default:
      return q;
  }
};
