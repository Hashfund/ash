import { eq, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { db } from "db";
import { mints, swaps } from "db/schema";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
} from "utils/pagination";
import { getAllMint, getMint, getMintWithExtraInfo } from "./mint.controller";
import { BN } from "bn.js";

const getAllMintRoute = async (
  req: FastifyRequest<{ Querystring: LimitOffsetPaginationQuery }>
) => {
  const paginator = new LimitOffsetPagination(
    buildURLFromRequest(req),
    req.query.limit ?? 16,
    req.query.offset ?? 0
  );

  const mints = await getAllMint(paginator.limit, paginator.getOffset());

  return paginator.getResponse(
    await Promise.all(mints.map(getMintWithExtraInfo))
  );
};

type GetMintParams = {
  id: string;
};

const getMintRoute = async (
  req: FastifyRequest<{ Params: GetMintParams }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const mint = await getMint(id);
  if (mint) return getMintWithExtraInfo(mint);

  return reply.status(400).send({
    message: "Mint with address not found",
  });
};

const getMintLeaderboardRoute = async () => {
  const swapResults = await db
    .select({
      mint: swaps.mint,
      volume:
        sql<string>`SUM(('x' || lpad(${swaps.amountIn}, 16, '0'))::bit(64)::bigint)`.as(
          "volume"
        ),
    })
    .from(swaps)
    .where(eq(swaps.tradeDirection, 0))
    .groupBy(swaps.mint)
    .orderBy(sql`volume DESC`)
    .execute();
  const results = await Promise.all(
    swapResults.map(async ({ mint, volume }) => ({
      volume,
      mint: await db.query.mints.findFirst({
        where: eq(mints.id, mint),
        with: { boundingCurve: true },
      }),
    }))
  );
  return Promise.all(
    results.map(async ({ mint }) => await getMintWithExtraInfo(mint!))
  );
};

export const mintRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      url: "/mints/",
      handler: getAllMintRoute,
    })
    .route({
      method: "GET",
      url: "/mints/:id/",
      handler: getMintRoute,
    })
    .route({
      method: "GET",
      url: "/mints/leaderboard/",
      handler: getMintLeaderboardRoute,
    });
};
