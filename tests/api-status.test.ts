import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("API status codes", () => {
	test("datasets list is 200", async () => {
		expect((await app.request("/api/datasets")).status).toBe(200);
	});

	test("missing dataset is 404", async () => {
		expect((await app.request("/api/datasets/missing")).status).toBe(404);
	});

	test("stats is 200", async () => {
		expect((await app.request("/api/stats")).status).toBe(200);
	});
});
