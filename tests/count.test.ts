import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("GET /api/datasets/count", () => {
	test("returns count of active datasets", async () => {
		const json = await (await app.request("/api/datasets/count")).json();
		expect(json.success).toBe(true);
		expect(typeof json.data.count).toBe("number");
		expect(json.data.count).toBeGreaterThan(0); // demo data
	});
});
