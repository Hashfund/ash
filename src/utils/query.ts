import { swaps } from "db/schema";
import {
  and,
  Column,
  eq,
  gt,
  gte,
  like,
  lt,
  lte,
  ne,
  or,
  SQLWrapper,
} from "drizzle-orm";

export const Grammer = {
  eq,
  lt,
  lte,
  gt,
  gte,
  like,
  ne,
};

swaps.id;

export const mapFilters = function (
  column: Column,
  filters: string[],
  value: any
) {
  const queries: SQLWrapper[] = [];

  for (const filter of filters) {
    if (filter in Grammer) {
      const grammer: SQLWrapper = Grammer[
        filter as unknown as keyof typeof Grammer
      ](column, value);
      queries.push(grammer);
    }
  }

  if (queries.length > 0) or(...queries);
  return queries;
};

export type QueryBuilder = {
  [key: string]: (filter: string[], value: any) => SQLWrapper[];
};

export const buildQuery = <T extends QueryBuilder>(
  builder: T,
  query: Record<string, any>
) => {
  const sqlWrappers: SQLWrapper[] = [];

  for (const [key, value] of Object.entries(query)) {
    const [column, ...filters] = key.split("__");
    sqlWrappers.push(...builder[column](filters, value));
  }
  if (sqlWrappers.length > 0) return and(...sqlWrappers);

  return sqlWrappers;
};
