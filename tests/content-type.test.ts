import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("Content-Type headers", () => {
	test("datasets list returns JSON", async () => {
		const res = await app.request("/api/datasets");
		expect(res.headers.get("content-type")).toContain("json");
	});

	test("stats returns JSON", async () => {
		const res = await app.request("/api/stats");
		expect(res.headers.get("content-type")).toContain("json");
	});

	test("404 returns JSON", async () => {
		const res = await app.request("/api/datasets/missing");
		expect(res.headers.get("content-type")).toContain("json");
	});
});
