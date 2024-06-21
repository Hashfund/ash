import { users } from "db/schema";
import { mapFilters, queryBuilder } from "utils/query";

export const userQuery = queryBuilder({
  id: mapFilters(users.id),
  name: mapFilters(users.name),
});
