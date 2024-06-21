import postgres from "postgres";
import { Column, SQL, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

import { DB_URL } from "../config";
import * as schema from "./schema";

const buildDB = <T extends Record<string, unknown>>(url: string, schema: T) => {
  const client = postgres(url);

  return drizzle(client, { schema });
};

export const db = buildDB(DB_URL, schema);

export const toBigInt = <T extends Column>(column: T) =>
  sql`('x' || lpad(${column}, 16, '0'))::bit(64)::bigint`;
export const caseWhen = (when: SQL | undefined, then: SQL) =>
  sql`case when ${when} then ${then} end`;
export const sub = <T extends Column | string, U extends Column | string>(
  a: T,
  b: U
) => sql`${a} - ${b}`;
export const hour = <T extends Column | string>(column: T) =>
  sql<number>`date_part('hour', ${column})`;
export const date = <T extends Column | string>(column: T) =>
  sql<number>`date(${column})`;
export const coalesce = <T extends SQL, U extends number | string>(
  exp: T,
  value: U
) => sql<U | number>`COALESCE(${exp}, ${value})`;
