import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { mints } from "./mint";
import { users } from "./user";

export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  amountIn: text("amount_in").notNull(),
  amountOut: text("amount_out").notNull(),
  marketCap: text("market_cap").notNull(),
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  tradeDirection: integer("trade_direction").notNull(),
  mint: text("mint")
    .references(() => mints.id, { onDelete: "cascade" })
    .notNull(),
  payer: text("payer")
    .references(() => users.id, { onDelete: "no action" })
    .notNull(),
});
