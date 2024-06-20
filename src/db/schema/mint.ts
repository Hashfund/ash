import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { users } from "./user";

export const mints = pgTable("mints", {
  id: text("id").primaryKey(),
  uri: text("uri").notNull(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  reserve: text("reserve").notNull(),
  signature: text("signature").notNull(),
  totalSupply: text("total_supply").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  creator: text("creator")
    .references(() => users.id, { onDelete: "no action" })
    .notNull(),
  canTrade: boolean("can_trade").default(true).notNull(),
});
