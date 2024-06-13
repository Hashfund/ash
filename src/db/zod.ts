import { createInsertSchema } from "drizzle-zod";
import { mints, boundingCurves, swaps } from "./schema";

export const insertMintSchema = createInsertSchema(mints, {
  uri: (schema) => schema.uri.url(),
});

export const insertBoundingCurveSchema = createInsertSchema(boundingCurves);
export const insertSwapSchema = createInsertSchema(swaps);
