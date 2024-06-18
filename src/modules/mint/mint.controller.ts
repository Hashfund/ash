import BN, { min } from "bn.js";

import { z } from "zod";
import { and, desc, eq, gte } from "drizzle-orm";

import { db } from "db";
import { mints, swaps } from "db/schema";
import type { insertMintSchema } from "db/zod";
import { resolveMetadataUri } from "utils/metadata";
import { NATIVE_MINT_DECIMALS } from "config";

export const createMint = function (values: z.infer<typeof insertMintSchema>) {
  return db.insert(mints).values(values).returning().execute();
};

export const getAllMint = function (limit: number, offset: number) {
  return db.query.mints.findMany({
    with: {
      boundingCurve: true,
    },
    limit,
    offset,
    orderBy: desc(mints.timestamp),
  });
};

export const getMint = function (id: string) {
  return db.query.mints
    .findFirst({
      where: eq(mints.id, id),
      with: {
        boundingCurve: true,
      },
    })
    .execute();
};

export const getMintWithExtraInfo = async function (
  mint: NonNullable<Awaited<ReturnType<typeof getMint>>>
) {
  const metadata = await resolveMetadataUri(mint.uri);
  const last24Hr = new Date();
  last24Hr.setTime(last24Hr.getTime() - 24 * 60 * 60 * 1000);

  const last24HrSwapIn = await db
    .select({
      amountIn: swaps.amountIn,
    })
    .from(swaps)
    .where(
      and(
        eq(swaps.mint, mint.id),
        gte(swaps.timestamp, last24Hr),
        eq(swaps.tradeDirection, 0)
      )
    )
    .execute();

  const last24HrVolume = last24HrSwapIn
    .map(({ amountIn }) => new BN(amountIn, "hex"))
    .reduce((a, b) => a.add(b), new BN(0));

  const totalVolumeIn = await db
    .select({
      amountIn: swaps.amountIn,
    })
    .from(swaps)
    .where(and(eq(swaps.mint, mint.id), eq(swaps.tradeDirection, 0)))
    .execute();

  const totalVolume = totalVolumeIn
    .map(({ amountIn }) => new BN(amountIn, "hex"))
    .reduce((a, b) => a.add(b), new BN(0));

  const last24HrVolumeChange = totalVolume.sub(last24HrVolume);
  const last24HrVolumeChangePercentage = last24HrVolumeChange
    .div(totalVolume)
    .mul(new BN(100));

  const lastSwapMarketCap = await db
    .select({ marketCap: swaps.marketCap })
    .from(swaps)
    .where(eq(swaps.mint, mint.id))
    .orderBy(desc(swaps.timestamp))
    .limit(1)
    .execute();

  const marketCap = lastSwapMarketCap
    .map((data) => new BN(data.marketCap, "hex"))
    .reduce((a, b) => a.add(b), new BN(0));

  return {
    ...mint,
    metadata,
    marketCap: marketCap,
    totalVolume: totalVolume,
    last24HrVolume: last24HrVolume,
    last24HrVolumeChange: last24HrVolumeChange,
    last24HrVolumeChangePercentage: last24HrVolumeChangePercentage,
  };
};
