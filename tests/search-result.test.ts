import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Search result format", () => {
	test("search returns datasets array", async () => {
		const json = await (await app.request("/api/datasets/search?q=crypto")).json();
		expect(Array.isArray(json.data.datasets)).toBe(true);
	});

	test("search returns query echo", async () => {
		const json = await (await app.request("/api/datasets/search?q=test")).json();
		expect(json.data.query).toBe("test");
	});

	test("search matches demo data", async () => {
		const json = await (await app.request("/api/datasets/search?q=Ethereum")).json();
		expect(json.data.datasets.length).toBeGreaterThanOrEqual(1);
	});
});
