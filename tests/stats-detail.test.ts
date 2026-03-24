import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Stats detail validation", () => {
	test("stats values are non-negative", async () => {
		const json = await (await app.request("/api/stats")).json();
		expect(json.data.activeDatasets).toBeGreaterThanOrEqual(0);
		expect(json.data.totalDatasets).toBeGreaterThanOrEqual(0);
		expect(json.data.totalSales).toBeGreaterThanOrEqual(0);
	});

	test("activeDatasets <= totalDatasets", async () => {
		const json = await (await app.request("/api/stats")).json();
		expect(json.data.activeDatasets).toBeLessThanOrEqual(json.data.totalDatasets);
	});
});
