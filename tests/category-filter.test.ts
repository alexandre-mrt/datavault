import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Category filter", () => {
	test("nlp category returns nlp datasets", async () => {
		const json = await (await app.request("/api/datasets?category=nlp")).json();
		for (const ds of json.data.datasets) {
			expect(ds.category).toBe("nlp");
		}
	});

	test("unknown category returns empty", async () => {
		const json = await (await app.request("/api/datasets?category=nonexistent")).json();
		expect(json.data.datasets.length).toBe(0);
	});
});
