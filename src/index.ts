import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { mintRoutes } from "./modules/mint/mint.route";
import { swapRoutes } from "./modules/swap/swap.route";
import { assetRoutes } from "modules/asset/asset.route";

const main = async () => {
  const app = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
  });

  await app.register(cors, {
    origin: "*",
  });

  mintRoutes(app);
  swapRoutes(app);
  assetRoutes(app);

  app
    .listen({ port: Number(process.env.PORT!), host: process.env.HOST! })
    .then((address) => {
      console.log("server started at", address);
    })
    .catch((error) => {
      app.log.error(error);
      process.exit(1);
    });
};

main().catch(console.log);
