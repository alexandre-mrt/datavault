import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Demo seed data", () => {
	test("demo-1 exists with correct name", async () => {
		const json = await (await app.request("/api/datasets/demo-1")).json();
		expect(json.data.name).toContain("Crypto");
	});

	test("demo-2 is blockchain category", async () => {
		const json = await (await app.request("/api/datasets/demo-2")).json();
		expect(json.data.category).toBe("blockchain");
	});

	test("all 4 demo datasets are active", async () => {
		for (const id of ["demo-1", "demo-2", "demo-3", "demo-4"]) {
			const json = await (await app.request(`/api/datasets/${id}`)).json();
			expect(json.data.active).toBe(true);
		}
	});
});
