import { test, describe, expect } from "bun:test";

import { LimitOffsetPagination } from "./pagination";

describe("paginate check", () => {
  test("should min and max offset", () => {
    let paginator = new LimitOffsetPagination("https://localhost:3000", 0, 16);
    expect(paginator.getOffset()).toBe(0);
    expect(paginator.nextURL()).toBe(
      "https://localhost:3000/?limit=16&offset=16"
    );

    paginator = new LimitOffsetPagination("https://domain.com", 33, 16);

    expect(paginator.getOffset()).toBe(32);
    expect(paginator.nextURL()).toBe("https://domain.com/?limit=16&offset=48");
  });
});
