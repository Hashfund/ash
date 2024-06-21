import type { z } from "zod";
import { and, desc, eq, gte, lte, SQL } from "drizzle-orm";

import { db, toBigInt } from "db";
import { boundingCurves, swaps } from "db/schema";
import type { insertBoundingCurveSchema, insertSwapSchema } from "db/zod";
import moment from "moment";

export const createBoundingCurve = function (
  value: z.infer<typeof insertBoundingCurveSchema>
) {
  return db.insert(boundingCurves).values(value).returning();
};

export const createSwap = function (value: z.infer<typeof insertSwapSchema>) {
  return db.insert(swaps).values(value).returning();
};

export const getAllSwaps = function (
  limit: number,
  offset: number,
  where?: SQL
) {
  return db.query.swaps.findMany({
    where,
    limit,
    offset,
    with: {
      payer: true,
    },
    extras: {
      amountIn: toBigInt(swaps.amountIn).as("amount_in"),
      amountOut: toBigInt(swaps.amountOut).as("amount_out"),
      marketCap: toBigInt(swaps.marketCap).as("market_cap"),
    },
    orderBy: desc(swaps.timestamp),
  });
};

export const getAllSwapByMint = function (
  mint: string,
  from?: string,
  to?: string
) {
  return db
    .select({
      date: swaps.timestamp,
      marketCap: toBigInt(swaps.marketCap),
    })
    .from(swaps)
    .where(
      and(
        eq(swaps.mint, mint),
        ...(from && to
          ? [
              gte(swaps.timestamp, moment(from).toDate()),
              lte(swaps.timestamp, moment(to).toDate()),
            ]
          : [])
      )
    );
};
