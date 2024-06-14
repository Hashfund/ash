import { swaps } from "db/schema";
import { buildQuery, mapFilters } from "./query";
console.log(
  buildQuery(
    {
      timestamp: (filters, value) =>
        mapFilters(swaps.timestamp, filters, value),
    },
    { timestamp__eq: 4 }
  )
);
