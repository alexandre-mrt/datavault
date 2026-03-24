import { describe, expect, test } from "bun:test";
import { nanoid } from "nanoid";

describe("Dataset ID generation", () => {
	test("IDs are unique", () => {
		const ids = new Set(Array.from({ length: 50 }, () => nanoid()));
		expect(ids.size).toBe(50);
	});

	test("IDs are URL-safe", () => {
		const id = nanoid();
		expect(encodeURIComponent(id)).toBe(id);
	});
});
