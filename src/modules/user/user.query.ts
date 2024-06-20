import { users } from "db/schema";
import { mapFilters, queryBuilder } from "utils/query";

export const userQuery = queryBuilder({
  id: (filters, value) => mapFilters(users.id, filters, value),
  name: (filters, value) => mapFilters(users.name, filters, value),
});
