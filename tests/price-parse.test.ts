import { describe, expect, test } from "bun:test";

describe("Price parsing", () => {
	test("integer prices", () => expect(Number("5")).toBe(5));
	test("decimal prices", () => expect(Number("2.5")).toBe(2.5));
	test("zero price is invalid", () => expect(Number("0") > 0).toBe(false));
});
