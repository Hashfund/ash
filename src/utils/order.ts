import { asc, desc, sql } from "drizzle-orm";

export const Grammer = {
  desc,
  asc,
};

export const orderByBuilder = (query?: string) => {
  if (!query) return;
  const split = query.split("__");
  let by: string | undefined = undefined;
  let value: string | undefined = undefined;

  if (split.length > 1) [by, value] = split;
  else [value] = split;

  if (by && by in Grammer)
    return Grammer[by as unknown as keyof typeof Grammer](sql`${value}`);
  else return sql`${value}`;
};
