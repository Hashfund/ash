import "dotenv/config";
import Fastify from "fastify";
import { mintRoutes } from "./modules/mint/mint.route";
import { swapRoutes } from "./modules/swap/swap.route";

const main = async () => {
  const app = Fastify();

  mintRoutes(app);
  swapRoutes(app);
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
