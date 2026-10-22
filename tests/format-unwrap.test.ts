import { describe, expect, test } from "bun:test";
import { unwrapResponse } from "../src/services/format.ts";

describe("unwrapResponse", () => {
  test("handles {items,total}", () => {
    expect(unwrapResponse({ items: [{ a: 1 }], total: 5 })).toEqual({
      items: [{ a: 1 }],
      total: 5,
    });
  });

  test("handles null and empty bodies", () => {
    expect(unwrapResponse(null).items).toEqual([]);
    expect(unwrapResponse("").items).toEqual([]);
  });

  test("wraps primitive array entries", () => {
    expect(unwrapResponse(["UTC", "Europe/Vilnius"]).items).toEqual([
      { value: "UTC" },
      { value: "Europe/Vilnius" },
    ]);
  });
});
