import type { z } from "zod";
import { desc, eq } from "drizzle-orm";

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

export const getAllSwapByMint = function (mint: string) {
  return db.query.swaps.findMany({
    where: eq(swaps.mint, mint),
    orderBy: desc(swaps.timestamp),
  });
};
