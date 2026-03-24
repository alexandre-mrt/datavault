import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { db } = await import("../src/services/db");

describe("DB indexes and mode", () => {
	test("journal mode is set", () => {
		const r = db.prepare("PRAGMA journal_mode").get() as { journal_mode: string };
		expect(["wal","memory"]).toContain(r.journal_mode);
	});

	test("datasets table has indexes", () => {
		const idx = db.prepare("PRAGMA index_list(datasets)").all();
		expect((idx as any[]).length).toBeGreaterThan(0);
	});
});
