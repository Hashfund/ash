import { describe, test } from "bun:test";
import { readFileSync } from "fs";
import { parseLogs } from "./log";

describe("Test log parser", () => {
  test("parse emit info", () => {
    const logs = JSON.parse(readFileSync(".idea/log.json", "utf-8"));

    parseLogs(logs);
  });
});
