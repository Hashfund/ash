import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { mints } from "../../db/schema";
import type { insertMintSchema } from "../../db/zod";

export const createMint = function (values: z.infer<typeof insertMintSchema>) {
  return db.insert(mints).values(values).returning().execute();
};

export const getAllMint = function (limit: number, offset: number) {
  return db.query.mints.findMany({
    with: {
      boundingCurve: true,
    },
    limit,
    offset,
    orderBy: desc(mints.timestamp),
  });
};

export const getMint = function (id: string) {
  return db.query.mints
    .findFirst({
      where: eq(mints.id, id),
      with: {
        boundingCurve: true,
      },
    })
    .execute();
};
