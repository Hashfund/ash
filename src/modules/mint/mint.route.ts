import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
} from "utils/pagination";
import { getAllMint, getMint } from "./mint.controller";
import { resolveMetadataUri } from "utils/metadata";
import { getLastestSwapByMint } from "modules/swap/swap.controller";

const getAllMintRoute = async (
  req: FastifyRequest<{ Querystring: LimitOffsetPaginationQuery }>
) => {
  const paginator = new LimitOffsetPagination(
    req.protocol + "://" + req.hostname + req.originalUrl,
    req.query.limit ?? 16,
    req.query.offset ?? 0
  );

  const results = await getAllMint(paginator.limit, paginator.getOffset());

  return paginator.getResponse(
    await Promise.all(
      results.map(async (result) => {
        const metadata = await resolveMetadataUri(result.uri);
        const lastestSwap = await getLastestSwapByMint(result.id);

        return {
          ...result,
          metadata,
          marketCap: lastestSwap?.marketCap ?? 0,
        };
      })
    )
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
  if (mint)
    return {
      ...mint,
      metadata: await resolveMetadataUri(mint.uri),
    };

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
