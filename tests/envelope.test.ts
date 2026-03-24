import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("API envelope consistency", () => {
	test("GET /datasets returns { success, data }", async () => {
		const json = await (await app.request("/api/datasets")).json();
		expect(json.success).toBe(true);
		expect(json.data).toHaveProperty("datasets");
		expect(json.data).toHaveProperty("page");
	});

	test("GET /stats returns { success, data }", async () => {
		const json = await (await app.request("/api/stats")).json();
		expect(json.success).toBe(true);
		expect(json.data).toHaveProperty("activeDatasets");
	});

	test("404 returns { success: false, error }", async () => {
		const json = await (await app.request("/api/datasets/missing")).json();
		expect(json.success).toBe(false);
		expect(typeof json.error).toBe("string");
	});

	test("search returns { success, data } with query", async () => {
		const json = await (await app.request("/api/datasets/search?q=test")).json();
		expect(json.success).toBe(true);
		expect(json.data).toHaveProperty("datasets");
		expect(json.data).toHaveProperty("query");
	});
});
