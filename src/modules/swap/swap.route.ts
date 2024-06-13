import type { FastifyInstance, FastifyRequest } from "fastify";
import { getAllSwapByMint } from "./swap.controller";

type GetAllSwapByMintParams = {
  mint: string;
};

const getAllSwapByMintRoute = function (
  req: FastifyRequest<{ Params: GetAllSwapByMintParams }>
) {
  const mint = req.params.mint;
  return getAllSwapByMint(mint);
};

export const swapRoutes = (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/swaps/:mint/",
    handler: getAllSwapByMintRoute,
  });
};
