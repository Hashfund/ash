import { caseWhen, db, toBigInt } from "db";
import { swaps, users } from "db/schema";
import { insertUserSchema } from "db/zod";
import { desc, eq, sql, SQL, SQLWrapper, sum } from "drizzle-orm";
import { z } from "zod";

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
      volumeIn: sum(
        caseWhen(eq(swaps.tradeDirection, 0), toBigInt(swaps.amountIn))
      ).as("volume_in"),
      volumeOut: sum(
        caseWhen(eq(swaps.tradeDirection, 1), toBigInt(swaps.amountOut))
      ).as("volume_out"),
    })
    .from(swaps)
    .rightJoin(users, eq(users.id, swaps.payer))
    .groupBy(swaps.payer, users.id)
    .orderBy(desc(sql`volume_in`))
    .execute();
};
