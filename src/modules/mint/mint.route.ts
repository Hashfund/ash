import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
} from "utils/pagination";
import { getAllMint, getMint, getMintWithExtraInfo } from "./mint.controller";

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

export const mintRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      handler: getAllMintRoute,
      url: "/mints/",
    })
    .route({
      method: "GET",
      handler: getMintRoute,
      url: "/mints/:id/",
    });
};
