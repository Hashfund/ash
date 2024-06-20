import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { zIsAddress } from "db/zod";
import { safeRequest } from "utils/metadata";
import { DateRangeQuery, dateRangeSchema } from "utils/date";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "utils/pagination";

import { mintQuery, orderLeaderboardBy, orderMintsBy } from "./mint.query";
import {
  getAllMint,
  getMint,
  getMintGraph,
  getMintLeaderboard,
} from "./mint.controller";
import moment from "moment";

type GetAllMintQuery = z.infer<typeof limitOffsetPaginationSchema> &
  DateRangeQuery &
  Record<string, string>;

const getAllMintSchema = limitOffsetPaginationSchema.extend(dateRangeSchema);

const getAllMintRoute = async (
  req: FastifyRequest<{
    Querystring: GetAllMintQuery;
  }>,
  reply: FastifyReply
) => {
  const { limit, offset, to, from, orderBy, ...rest } = req.query;

  const query = mintQuery(rest);

  return getAllMintSchema
    .parseAsync({ limit, offset, to, from })
    .then(async ({ limit, offset, to, from }) => {
      const paginator = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit,
        offset
      );

      return paginator.getResponse(
        await Promise.all(
          (
            await orderMintsBy(
              orderBy,
              getAllMint(
                { to, from },
                paginator.limit,
                paginator.getOffset(),
                query
              )
            ).execute()
          ).map(async (mint) => ({
            ...mint,
            metadata: await safeRequest(mint.uri),
          }))
        )
      );
    })
    .catch((error) => reply.status(400).send(error));
};

type GetMintParams = {
  id: string;
};

const getMintParamSchema = z.object({
  id: zIsAddress,
});

const getMintQuerySchema = z.object(dateRangeSchema);

const getMintRoute = async (
  req: FastifyRequest<{ Params: GetMintParams; Querystring: DateRangeQuery }>,
  reply: FastifyReply
) => {
  return getMintParamSchema
    .parseAsync(req.params)
    .then(async ({ id }) => {
      return getMintQuerySchema.parseAsync(req.query).then(async (filter) => {
        const mints = await getMint(id, filter);
        if (mints.length === 0)
          return reply.status(400).send({
            message: "Mint with address not found",
          });

        const [mint] = mints;

        return { ...mint, metadata: await safeRequest(mint.uri) };
      });
    })
    .catch((error) => reply.status(400).send(error.format()));
};

const getMintLeaderboardRoute = async (
  req: FastifyRequest<{
    Params: z.infer<typeof getAllMintSchema>;
    Querystring: { orderBy: string };
  }>,
  reply: FastifyReply
) => {
  return getMintParamSchema
    .parseAsync(req.params)
    .then(({ id }) =>
      orderLeaderboardBy(req.query.orderBy, getMintLeaderboard(id)).execute()
    )
    .catch((error) => reply.status(400).send(error.format()));
};

const getDateRangeSchema = z.object(dateRangeSchema).extend({
  unit: z.union([z.literal("day"), z.literal("time")]),
});

const getMintGraphRoute = async (
  req: FastifyRequest<{
    Params: z.infer<typeof getAllMintSchema>;
    Querystring: DateRangeQuery;
  }>,
  reply: FastifyReply
) =>
  getMintParamSchema
    .parseAsync(req.params)
    .then(({ id }) =>
      getDateRangeSchema.parseAsync(req.query).then(async (filter) => {
        const result = await getMintGraph(id, filter);
        if (filter.unit === "time")
          return result.map((data) => ({
            ...data,
            date: moment().subtract(data.date, "hour"),
          }));
        return result;
      })
    )
    .catch((error) => reply.status(400).send(error));

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
      url: "/mints/:id/leaderboard/",
      handler: getMintLeaderboardRoute,
    })
    .route({
      method: "GET",
      url: "/mints/:id/graph",
      handler: getMintGraphRoute,
    });
};
