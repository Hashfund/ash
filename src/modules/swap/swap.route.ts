import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { zIsAddress } from "db/zod";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "utils/pagination";
import { getAllSwapByMint } from "./swap.controller";

const getAllSwapByMintSchema = z.object({
  mint: zIsAddress,
});

const getAllSwapByMintRoute = async function (
  req: FastifyRequest<{
    Params: z.infer<typeof getAllSwapByMintSchema>;
    Querystring: z.infer<typeof limitOffsetPaginationSchema>;
  }>,
  reply: FastifyReply
) {
  return getAllSwapByMintSchema
    .parseAsync(req.params)
    .then(({ mint }) => {
      return limitOffsetPaginationSchema
        .parseAsync(req.query)
        .then(async ({ limit, offset }) => {
          const paginator = new LimitOffsetPagination(
            buildURLFromRequest(req),
            limit,
            offset
          );
          return paginator.getResponse(
            await getAllSwapByMint(mint, paginator.limit, paginator.getOffset())
          );
        });
    })
    .catch((error) => reply.status(404).send(error));
};

export const swapRoutes = (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/swaps/:mint/",
    handler: getAllSwapByMintRoute,
  });
};
