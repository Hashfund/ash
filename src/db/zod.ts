import bs58 from "bs58";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users, mints, boundingCurves, swaps } from "./schema";

import { z } from "zod";
import { isAddress } from "utils/web3";

export const zIsAddress = z.custom<string>((value) => isAddress(value));

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const selectMintSchema = createSelectSchema(mints);
export const insertMintSchema = createInsertSchema(mints, {
  uri: (schema) => schema.uri.url(),
  creator: zIsAddress,
  reserve: zIsAddress,
});

export const selectBoundingCurveSchema = createSelectSchema(boundingCurves);
export const insertBoundingCurveSchema = createInsertSchema(boundingCurves, {
  id: zIsAddress,
  mint: zIsAddress,
});

export const selectSwapSchema = createSelectSchema(swaps);
export const insertSwapSchema = createInsertSchema(swaps, {
  mint: zIsAddress,
  payer: zIsAddress,
});
