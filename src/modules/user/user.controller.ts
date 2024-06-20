import { z } from "zod";
import { desc, eq, sql, SQL, sum } from "drizzle-orm";

import { swaps, users } from "db/schema";
import { insertUserSchema } from "db/zod";
import { caseWhen, coalesce, db, toBigInt } from "db";

export const getAllUsers = (
  where: SQL | undefined,
  limit: number,
  offset: number
) => {
  return db.query.users.findMany({
    where,
    limit,
    offset,
    with: {
      mints: {
        columns: {
          id: true,
        },
      },
      swaps: {
        columns: {
          id: true,
        },
      },
    },
  });
};

export const getOrCreateUser = (id: string) => {
  return db
    .insert(users)
    .values({ id })
    .onConflictDoNothing()
    .returning()
    .execute();
};

export const updateUser = (
  id: string,
  values: z.infer<typeof insertUserSchema>
) => {
  return db
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning()
    .execute();
};

export const getUsersLeaderboard = () => {
  return db
    .select({
      user: users,
      volumeIn: coalesce(
        sum(caseWhen(eq(swaps.tradeDirection, 0), toBigInt(swaps.amountIn))),
        0
      ).as("volume_in"),
      volumeOut: coalesce(
        sum(caseWhen(eq(swaps.tradeDirection, 1), toBigInt(swaps.amountOut))),
        0
      ).as("volume_out"),
    })
    .from(swaps)
    .rightJoin(users, eq(users.id, swaps.payer))
    .groupBy(swaps.payer, users.id)
    .orderBy(desc(sql`volume_in`))
    .execute();
};
