import { desc, sql } from "drizzle-orm";

import { mints } from "db/schema";
import { mapFilters, queryBuilder } from "utils/query";

import { getAllMint, getMintLeaderboard } from "./mint.controller";

export const mintQuery = queryBuilder({
  canTrade: (filters, value) => mapFilters(mints.canTrade, filters, value),
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
