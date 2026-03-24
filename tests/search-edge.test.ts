import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("Search edge cases", () => {
	test("search with special characters", async () => {
		const res = await app.request("/api/datasets/search?q=%25%27%22");
		expect(res.status).toBe(200);
	});

	test("search truncates long query", async () => {
		const res = await app.request(`/api/datasets/search?q=${"x".repeat(300)}`);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.query.length).toBeLessThanOrEqual(200);
	});

	test("empty search returns empty array", async () => {
		const json = await (await app.request("/api/datasets/search?q=")).json();
		expect(json.data.datasets).toEqual([]);
	});

	test("whitespace-only search returns empty", async () => {
		const json = await (await app.request("/api/datasets/search?q=+++")).json();
		expect(json.data.datasets).toEqual([]);
	});
});
