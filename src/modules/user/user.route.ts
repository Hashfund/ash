import { z } from "zod";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { userQuery } from "./user.query";
import {
  getAllUsers,
  getOrCreateUser,
  getUsersLeaderboard,
  updateUser,
} from "./user.controller";
import { insertUserSchema, zIsAddress } from "db/zod";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
  limitOffsetPaginationSchema,
} from "utils/pagination";

const getAllUsersRoute = async (
  req: FastifyRequest<{
    Querystring: LimitOffsetPaginationQuery & Record<string, any>;
  }>,
  reply: FastifyReply
) => {
  const { limit, offset, ...query } = req.query;

  return limitOffsetPaginationSchema
    .parseAsync({ limit, offset })
    .then(async ({ limit, offset }) => {
      const q = userQuery(query);
      const paginator = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit ?? 16,
        offset ?? 0
      );

      return paginator.getResponse(
        await getAllUsers(q, paginator.limit, paginator.getOffset())
      );
    })
    .catch((error) => reply.status(400).send(error.format()));
};

const getOrCreateUserParamSchema = z.object({
  id: zIsAddress,
});

const getOrCreateUserRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof getOrCreateUserParamSchema> }>,
  reply: FastifyReply
) => {
  return getOrCreateUserParamSchema
    .parseAsync(req.params)
    .then(async (params) => {
      const q = userQuery(params);
      const [user] = await getOrCreateUser(params.id);
      return user;
    })
    .catch((error) => reply.status(400).send(error.format()));
};

const updateUserSchema = z.object({
  id: zIsAddress,
});

const updateUserRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof updateUserSchema> }>,
  reply: FastifyReply
) => {
  return updateUserSchema
    .parseAsync(req.params)
    .then(({ id }) => {
      return insertUserSchema.parseAsync(req.body).then(async (body) => {
        const users = await updateUser(id, body);
        if (users.length > 0) return users.at(0);
        return reply.status(404).send({
          error: "user not found",
        });
      });
    })
    .catch((error) => reply.status(404).send(error.format()));
};

const getUsersLeaderboardRoute = () => getUsersLeaderboard();

export const userRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      url: "/users/",
      handler: getAllUsersRoute,
    })
    .route({
      method: "GET",
      url: "/users/:id/",
      handler: getOrCreateUserRoute,
    })
    .route({
      method: "POST",
      url: "/users/:id/",
      handler: updateUserRoute,
    })
    .route({
      method: "GET",
      url: "/users/leaderboard",
      handler: getUsersLeaderboardRoute,
    });
};
