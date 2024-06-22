import { swaps } from "db/schema";
import { queryBuilder, mapFilters } from "./query";
console.log(
  queryBuilder({
    timestamp: mapFilters(swaps.timestamp),
  })({ timestamp__eq: 4 })
);
