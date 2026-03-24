import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

const app = new Hono();
app.get("/health", (c) => c.json({ status: "ok" }));

describe("Health endpoint", () => {
	test("returns 200", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
	});

	test("has status ok", async () => {
		const json = await (await app.request("/health")).json();
		expect(json.status).toBe("ok");
	});
});
