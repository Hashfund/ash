import type { z } from "zod";
import { desc, eq, sql, sum } from "drizzle-orm";

import { caseWhen, coalesce, db, toBigInt } from "db";
import { boundingCurves, swaps } from "db/schema";
import type { insertBoundingCurveSchema, insertSwapSchema } from "db/zod";

export const createBoundingCurve = function (
  value: z.infer<typeof insertBoundingCurveSchema>
) {
  return db.insert(boundingCurves).values(value).returning();
};

export const createSwap = function (value: z.infer<typeof insertSwapSchema>) {
  return db.insert(swaps).values(value).returning();
};

export const getAllSwapByMint = function (
  mint: string,
  limit: number,
  offset: number
) {
  const lastSwap = db
    .select({
      mint: swaps.mint,
      marketCap: toBigInt(swaps.marketCap).as("lastSwap.market_cap"),
    })
    .from(swaps)
    .where(eq(swaps.mint, mint))
    .orderBy(desc(swaps.timestamp))
    .limit(1)
    .as("lastSwap");

  return db
    .select({
      marketCap: lastSwap.marketCap,
      timestamp: sql`date(${swaps.timestamp})`.as("date"),
      volumeIn: coalesce(
        sum(caseWhen(eq(swaps.tradeDirection, 0), toBigInt(swaps.amountIn))),
        0
      ),
    })
    .from(swaps)
    .rightJoin(lastSwap, eq(swaps.mint, lastSwap.mint))
    .where(eq(swaps.mint, mint))
    .orderBy(desc(sql`date`))
    .limit(limit)
    .offset(offset);
};
