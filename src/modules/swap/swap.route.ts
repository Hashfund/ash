import type { FastifyInstance, FastifyRequest } from "fastify";
import { getAllSwapByMint } from "./swap.controller";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
} from "utils/pagination";

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

export const swapRoutes = (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/swaps/:mint/",
    handler: getAllSwapByMintRoute,
  });
};
