import { describe, expect, test } from "bun:test";
import {
  dateRange,
  extractFields,
  formatCsv,
  formatTable,
} from "../src/services/format.ts";

describe("extractFields", () => {
  test("flattens nested objects", () => {
    const result = extractFields({ a: { b: "c" } });
    expect(result).toEqual([["a.b", "c"]]);
  });

  test("handles null and undefined", () => {
    const result = extractFields({ a: null, b: undefined });
    expect(result).toEqual([
      ["a", ""],
      ["b", ""],
    ]);
  });

  test("stringifies arrays", () => {
    const result = extractFields({ tags: [1, 2] });
    expect(result).toEqual([["tags", "[1,2]"]]);
  });

  test("converts scalars to strings", () => {
    const result = extractFields({ n: 42, b: true });
    expect(result).toEqual([
      ["n", "42"],
      ["b", "true"],
    ]);
  });
});

describe("formatTable", () => {
  test("returns no data for empty array", () => {
    expect(formatTable([])).toBe("(no data)");
  });

  test("includes title", () => {
    expect(formatTable([], "Title")).toBe("Title\n(no data)");
  });

  test("formats rows with aligned columns", () => {
    const result = formatTable([
      { name: "foo", value: "1" },
      { name: "barbaz", value: "22" },
    ]);
    expect(result).toContain("name");
    expect(result).toContain("value");
    expect(result).toContain("foo");
    expect(result).toContain("barbaz");
  });
});

describe("formatCsv", () => {
  test("returns empty string for no data", () => {
    expect(formatCsv([])).toBe("");
  });

  test("escapes commas and quotes", () => {
    const result = formatCsv([{ a: 'hello, "world"' }]);
    expect(result).toContain('"hello, ""world"""');
  });
});

describe("dateRange", () => {
  test("returns YYYY-MM-DD strings", () => {
    const { date_from, date_to } = dateRange(7);
    expect(date_from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(date_to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("from is before to", () => {
    const { date_from, date_to } = dateRange(30);
    expect(new Date(date_from).getTime()).toBeLessThan(new Date(date_to).getTime());
  });
});
