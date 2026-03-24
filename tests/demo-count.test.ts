import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { db } = await import("../src/services/db");

describe("Demo data count", () => {
	test("exactly 4 demo datasets seeded", () => {
		const r = db.prepare("SELECT COUNT(*) as c FROM datasets WHERE id LIKE 'demo-%'").get() as { c: number };
		expect(r.c).toBe(4);
	});

	test("3 tables exist", () => {
		const tables = db.prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table'").get() as { c: number };
		expect(tables.c).toBeGreaterThanOrEqual(3);
	});
});
