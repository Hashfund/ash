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
  SQL,
  SQLWrapper,
} from "drizzle-orm";
import { Sql } from "postgres";

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
  const queries: SQL[] = [];

  if (filters.length === 0) return eq(column, value);

  for (const filter of filters) {
    if (filter in Grammer) {
      const grammer = Grammer[filter as unknown as keyof typeof Grammer](
        column,
        value
      );
      queries.push(grammer);
    } else {
      queries.push(eq(column, value));
    }
  }

  if (queries.length > 0) return or(...queries);
  return queries.at(0);
};

export type QueryBuilder = {
  [key: string]: (filter: string[], value: any) => SQL | undefined;
};

export const queryBuilder = <T extends QueryBuilder>(builder: T) => {
  return (query: Record<string, any>) => {
    const sqlWrappers: (SQL | undefined)[] = [];

    for (const [key, value] of Object.entries(query)) {
      const [column, ...filters] = key.split("__");
      if (column in builder) {
        const results = builder[column](filters, value);
        sqlWrappers.push(results);
      }
    }
    if (sqlWrappers.length > 0) return and(...sqlWrappers);

    return sqlWrappers.at(0);
  };
};
