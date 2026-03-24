import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Pagination edge cases", () => {
	test("page 1 returns data", async () => {
		const json = await (await app.request("/api/datasets?page=1")).json();
		expect(json.data.page).toBe(1);
		expect(json.data.datasets.length).toBeGreaterThan(0); // demo data
	});

	test("very high page returns empty", async () => {
		const json = await (await app.request("/api/datasets?page=99999")).json();
		expect(json.data.datasets).toEqual([]);
	});
});
