import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Response shape consistency", () => {
	test("datasets list has datasets array", async () => {
		const json = await (await app.request("/api/datasets")).json();
		expect(Array.isArray(json.data.datasets)).toBe(true);
	});

	test("search returns query string back", async () => {
		const json = await (await app.request("/api/datasets/search?q=crypto")).json();
		expect(json.data.query).toBe("crypto");
	});
});
