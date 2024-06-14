import type { z } from "zod";
import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "../../db";
import { boundingCurves, swaps } from "../../db/schema";
import type { insertBoundingCurveSchema, insertSwapSchema } from "../../db/zod";
import { BN } from "bn.js";

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
  return db.query.swaps.findMany({
    where: eq(swaps.mint, mint),
    orderBy: desc(swaps.timestamp),
    limit,
    offset,
  });
};

export const getLastestSwapByMint = function (mint: string) {
  return db.query.swaps.findFirst({
    where: eq(swaps.mint, mint),
    orderBy: desc(swaps.timestamp),
  });
};

export const getSwapsGraphByMint = async function (
  mint: string,
  from: Date,
  to: Date
) {
  const response = await db
    .select({
      x: swaps.timestamp,
      y: swaps.marketCap,
    })
    .from(swaps)
    .where(
      and(
        eq(swaps.mint, mint),
        gte(swaps.timestamp, from),
        lte(swaps.timestamp, to)
      )
    )
    .orderBy(desc(swaps.timestamp))
    .execute();

  return response.map(({ x, y }) => ({
    x,
    y: new BN(y, "hex").div(new BN(10).pow(new BN(9))),
  }));
};
