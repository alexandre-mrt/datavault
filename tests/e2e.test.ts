import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("End-to-end: create -> search -> stats", () => {
	test("full data marketplace journey", async () => {
		// 1. Create dataset
		const createRes = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xe2e",
				name: "E2E Dataset",
				description: "End-to-end test dataset",
				category: "blockchain",
				tags: ["e2e", "test"],
				rootHash: "0xe2ehash",
				format: "parquet",
				price: "42",
			}),
		});
		const { id } = (await createRes.json()).data;

		// 2. Retrieve by ID
		const ds = (await (await app.request(`/api/datasets/${id}`)).json()).data;
		expect(ds.name).toBe("E2E Dataset");
		expect(ds.format).toBe("parquet");
		expect(ds.price).toBe("42");

		// 3. Found in search
		const search = (await (await app.request("/api/datasets/search?q=E2E")).json()).data;
		expect(search.datasets.some((d: { id: string }) => d.id === id)).toBe(true);

		// 4. Stats reflect new dataset
		const stats = (await (await app.request("/api/stats")).json()).data;
		expect(stats.totalDatasets).toBeGreaterThan(0);
	});
});
