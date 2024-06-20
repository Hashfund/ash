import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { mints } from "./mint";

export const boundingCurves = pgTable("boundingCurve", {
  id: text("id").primaryKey(),
  signature: text("signature").notNull(),
  tradable: boolean("tradable").default(true),
  timestamp: timestamp("timestamp").notNull(),
  initialPrice: text("initial_price").notNull(),
  maximumMarketCap: text("maximum_market_cap").notNull(),
  mint: text("mint")
    .references(() => mints.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});
