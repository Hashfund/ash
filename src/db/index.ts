import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { DB_URL } from "../config";
import * as schema from "./schema";

const buildDB = <T extends Record<string, unknown>>(url: string, schema: T) => {
  const client = postgres(url);

  return drizzle(client, { schema });
};

export const db = buildDB(DB_URL, schema);
