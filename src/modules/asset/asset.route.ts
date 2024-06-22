import ImageKit from "imagekit";
import { FastifyInstance } from "fastify";
import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } from "config";


export const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: "https://ik.imagekit.io/hashfund/",
});

const imagekitAuthRoute = function () {
  return imagekit.getAuthenticationParameters();
};

const uploadFileRoute = function () {
  return {};
};

export const assetRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      url: "/imagekit/auth",
      handler: imagekitAuthRoute,
    })
    .route({
      method: "POST",
      url: "/imagekit/upload",
      handler: uploadFileRoute,
    });
};
