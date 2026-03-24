import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { db } = await import("../src/services/db");

describe("DB schema", () => {
	test("datasets table exists", () => {
		const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='datasets'").get();
		expect(result).toBeTruthy();
	});

	test("reviews table exists", () => {
		const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'").get();
		expect(result).toBeTruthy();
	});
});
