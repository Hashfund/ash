import { BN } from "bn.js";
import type { z } from "zod";
import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "../../db";
import { boundingCurves, swaps } from "../../db/schema";
import type { insertBoundingCurveSchema, insertSwapSchema } from "../../db/zod";

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

export const getSwapsVolumeGraphByMint = async function (
  mint: string,
  from: Date,
  to: Date
) {
  const dates: Date[] = [];
  while (from <= to) {
    dates.push(new Date(from));
    from.setDate(from.getDate() + 1);
  }

  const results = [];

  for (const date of dates) {
    const response = await db
      .select({
        amountIn: swaps.amountIn,
      })
      .from(swaps)
      .where(and(eq(swaps.mint, mint), gte(swaps.timestamp, date)))
      .orderBy(swaps.timestamp)
      .execute();

    results.push({
      x: date,
      y: response
        .map(({ amountIn }) =>
          new BN(amountIn, "hex").div(new BN(10).pow(new BN(9)))
        )
        .reduce((a, b) => a.add(b), new BN(0)),
    });
  }

  return results;
};
