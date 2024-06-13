import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const mints = pgTable("mints", {
  id: text("id").primaryKey(),
  uri: text("uri").notNull(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  creator: text("creator").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  reserve: text("reserve").notNull(),
  totalSupply: text("totalSupply").notNull(),
});

export const boundingCurves = pgTable("boundingCurve", {
  id: text("id").primaryKey(),
  mint: text("mint")
    .references(() => mints.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  initialPrice: text("initialPrice").notNull(),
  maximumMarketCap: text("maximumMarketCap").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const swaps = pgTable("swap", {
  id: serial("id").primaryKey(),
  mint: text("mint")
    .references(() => mints.id, { onDelete: "cascade" })
    .notNull(),
  amountIn: text("amountIn").notNull(),
  amountOut: text("amountOut").notNull(),
  tradeDirection: integer("tradeDirection").notNull(),
  marketCap: text("marketCap").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  payer: text("payer").notNull(),
});

export const mintsRelations = relations(mints, ({ one }) => ({
  boundingCurve: one(boundingCurves, {
    fields: [mints.id],
    references: [boundingCurves.mint],
  }),
}));
