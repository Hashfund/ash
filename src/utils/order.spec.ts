import {describe, test} from "bun:test";
import { orderByBuilder } from "./order";

describe("should build order-by query", () => {
    test("build map query", () => {
        const q = orderByBuilder("desc__timestamp");
        console.log(q)
    })
})