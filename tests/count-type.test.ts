import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Count type", () => {
	test("count is integer", async () => {
		const json = await (await app.request("/api/datasets/count")).json();
		expect(Number.isInteger(json.data.count)).toBe(true);
	});
	test("count includes demo data", async () => {
		const json = await (await app.request("/api/datasets/count")).json();
		expect(json.data.count).toBeGreaterThanOrEqual(4);
	});
});
