import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
} from "utils/pagination";
import { getAllSwapByMint, getSwapsGraphByMint, getSwapsVolumeGraphByMint } from "./swap.controller";

type GetAllSwapByMintParams = {
  mint: string;
};

const getAllSwapByMintRoute = async function (
  req: FastifyRequest<{
    Params: GetAllSwapByMintParams;
    Querystring: LimitOffsetPaginationQuery;
  }>
) {
  const mint = req.params.mint;
  const { limit, offset } = req.query;
  const paginator = new LimitOffsetPagination(
    buildURLFromRequest(req),
    limit ?? 16,
    offset ?? 0
  );
  return paginator.getResponse(
    await getAllSwapByMint(mint, paginator.limit, paginator.getOffset())
  );
};

type SwapGraphQuery = {
  to: string;
  from: string;
  type?: "volume" | "marketcap";
};

type SwapGraphParams = {
  mint: string;
};

const QuerySchema = z.object({
  from: z
    .string({
      invalid_type_error: "Invalid date format",
      required_error: "from is required in query",
    })
    .datetime(),
  to: z
    .string({
      invalid_type_error: "Invalid date format",
      required_error: "to is required in query",
    })
    .datetime(),
});

const getSwapsGraphByMintRoutes = function (
  req: FastifyRequest<{ Querystring: SwapGraphQuery; Params: SwapGraphParams }>,
  reply: FastifyReply
) {
  const { mint } = req.params;
  const type = req.query.type ?? "marketcap";

  return QuerySchema.parseAsync(req.query)
    .then((query) =>
      type === "marketcap"
        ? getSwapsGraphByMint(mint, new Date(query.from), new Date(query.to))
        : getSwapsVolumeGraphByMint(mint, new Date(query.from), new Date(query.to))
    )
    .catch((error) =>
      reply.status(400).send({
        error: error.format(),
      })
    );
};

export const swapRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      url: "/swaps/:mint/",
      handler: getAllSwapByMintRoute,
    })
    .route({
      method: "GET",
      url: "/swaps/graph/:mint",
      handler: getSwapsGraphByMintRoutes,
    });
};
