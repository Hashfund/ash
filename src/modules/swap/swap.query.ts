import { swaps } from "db/schema";
import { mapFilters, queryBuilder } from "utils/query";

export const swapQuery = queryBuilder({
  mint: mapFilters(swaps.mint),
  payer: mapFilters(swaps.payer),
});
