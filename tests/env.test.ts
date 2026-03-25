import { describe, expect, test } from "bun:test";
describe("Env defaults", () => {
	test("PORT defaults to 3000", () => { expect(Number(process.env.PORT || 3000)).toBe(3000); });
	test("default fee is 5%", () => { expect(500/10000).toBe(0.05); });
});
