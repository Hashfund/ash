import { z } from "zod";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { userQuery } from "./user.query";
import {
  getAllUsers,
  getOrCreateUser,
  getUsersLeaderboard,
  getUserTokens,
  updateUser,
} from "./user.controller";
import { insertUserSchema, zIsAddress } from "db/zod";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
  limitOffsetPaginationSchema,
} from "utils/pagination";
import { safeRequest } from "utils/metadata";

const IdParamSchema = z.object({
  id: zIsAddress,
});

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

const getOrCreateUserRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof IdParamSchema> }>,
  reply: FastifyReply
) => {
  return IdParamSchema.parseAsync(req.params)
    .then(async (params) => {
      const q = userQuery(params);
      const [user] = await getOrCreateUser(params.id);
      return user;
    })
    .catch((error) => reply.status(400).send(error.format()));
};

const updateUserRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof IdParamSchema> }>,
  reply: FastifyReply
) => {
  return IdParamSchema.parseAsync(req.params)
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

const getUserTokensRoute = (
  req: FastifyRequest<{
    Params: z.infer<typeof IdParamSchema> &
      z.infer<typeof limitOffsetPaginationSchema>;
  }>
) => {
  return IdParamSchema.parseAsync(req.params).then(({ id }) =>
    limitOffsetPaginationSchema
      .parseAsync(req.query)
      .then(async ({ limit, offset }) => {
        const paginator = new LimitOffsetPagination(
          buildURLFromRequest(req),
          limit,
          offset
        );
        const tokens = await getUserTokens(
          id,
          paginator.limit,
          paginator.getOffset()
        );

        return paginator.getResponse(
          await Promise.all(
            tokens.map(async (token) => ({
              ...token,
              metadata: await safeRequest(token.uri),
            }))
          )
        );
      })
  );
};

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
    })
    .route({
      method: "GET",
      url: "/users/:id/tokens",
      handler: getUserTokensRoute,
    });
};
