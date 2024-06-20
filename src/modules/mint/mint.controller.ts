import { z } from "zod";
import moment from "moment";
import {
  and,
  avg,
  desc,
  eq,
  getTableColumns,
  gte,
  lt,
  lte,
  or,
  sql,
  SQL,
  sum,
} from "drizzle-orm";

import { caseWhen, date, db, hour, toBigInt } from "db";
import type { insertMintSchema } from "db/zod";
import { boundingCurves, mints, swaps, users } from "db/schema";
import { buildRange, TimeUnit } from "utils/date";

export const createMint = function (values: z.infer<typeof insertMintSchema>) {
  return db.insert(mints).values(values).returning().execute();
};

type Filter = {
  to?: string;
  from?: string;
  unit?: TimeUnit;
};

export const createMintsQuery = (filter: Filter) => {
  const to = filter.to ? moment(filter.to).toDate() : new Date();
  const from = filter.from
    ? moment(filter.from).toDate()
    : moment().subtract(1, "day").toDate();

  const lastSwap = db
    .select({
      mint: swaps.mint,
      marketCap: swaps.marketCap,
    })
    .from(swaps)
    .limit(1)
    .orderBy(desc(swaps.timestamp))
    .as("lastSwap");

  return db
    .select({
      ...getTableColumns(mints),
      totalSupply: toBigInt(mints.totalSupply),
      boundingCurve: {
        ...getTableColumns(boundingCurves),
        initialPrice: toBigInt(boundingCurves.initialPrice),
        maximumMarketCap: toBigInt(boundingCurves.maximumMarketCap),
      },
      marketCap: toBigInt(lastSwap.marketCap),
      volumeIn: sum(
        caseWhen(
          and(eq(swaps.tradeDirection, 0), lt(swaps.timestamp, from)),
          toBigInt(swaps.amountIn)
        )
      ).as("volume_in"),
      volumeOut: sum(
        caseWhen(
          and(eq(swaps.tradeDirection, 1), lt(swaps.timestamp, from)),
          toBigInt(swaps.amountOut)
        )
      ),
      volumeInFrom: sum(
        caseWhen(
          and(
            eq(swaps.tradeDirection, 0),
            gte(swaps.timestamp, from),
            lte(swaps.timestamp, to)
          ),
          toBigInt(swaps.amountIn)
        )
      ),
      volumeOutFrom: sum(
        caseWhen(
          and(
            eq(swaps.tradeDirection, 1),
            gte(swaps.timestamp, from),
            lte(swaps.timestamp, to)
          ),
          toBigInt(swaps.amountOut)
        )
      ),
    })
    .from(swaps)
    .innerJoin(lastSwap, eq(swaps.mint, lastSwap.mint))
    .rightJoin(boundingCurves, eq(swaps.mint, boundingCurves.mint))
    .rightJoin(mints, eq(swaps.mint, mints.id))
    .groupBy(swaps.mint, mints.id, lastSwap.marketCap, boundingCurves.id);
};

export const getAllMint = (
  filter: Filter,
  limit: number,
  offset: number,
  where?: SQL
) => {
  return createMintsQuery(filter).where(where).limit(limit).offset(offset);
};

export const getMint = (id: string, filter: Filter) =>
  createMintsQuery(filter).where(eq(mints.id, id)).limit(1).execute();

export const getMintLeaderboard = (id: string) => {
  return db
    .select({
      user: users,
      volumeIn: sum(
        caseWhen(eq(swaps.tradeDirection, 0), toBigInt(swaps.amountIn))
      ).as("volume_in"),
      volumeOut: sum(
        caseWhen(eq(swaps.tradeDirection, 1), toBigInt(swaps.amountOut))
      ).as("volume_out"),
    })
    .from(swaps)
    .rightJoin(users, eq(users.id, swaps.payer))
    .where(eq(swaps.mint, id))
    .groupBy(swaps.payer, users.id);
};

export const getMintGraph = (id: string, filter: NonNullable<Filter>) => {
  const to = moment(filter.to);
  const from = moment(filter.from);
  console.log(
    buildRange(to, from, filter.unit!)
  )

  const range = buildRange(to, from, filter.unit!).map((date) =>
    and(gte(swaps.timestamp, date), lte(swaps.timestamp, date))
  );

  return db
    .select({
      date: (filter.unit === "time"
        ? hour(swaps.timestamp)
        : date(swaps.timestamp)
      ).as("date"),
      volumeIn: sum(toBigInt(swaps.amountIn)),
      volumeOut: sum(toBigInt(swaps.amountOut)),
      marketCap: avg(toBigInt(swaps.marketCap)),
    })
    .from(swaps)
    .where(and(eq(swaps.mint, id), or(...range)))
    .orderBy(sql`date`)
    .groupBy(sql`date`);
};
