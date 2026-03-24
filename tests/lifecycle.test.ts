import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("Dataset full lifecycle", () => {
	test("create -> get -> search -> stats", async () => {
		// 1. Create
		const createRes = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xlifecycle",
				name: "Lifecycle Dataset",
				description: "End-to-end lifecycle test",
				category: "finance",
				tags: ["lifecycle", "test"],
				rootHash: "0xlifecyclehash",
				format: "csv",
				price: "30",
				license: "commercial",
			}),
		});
		expect(createRes.status).toBe(201);
		const { id } = (await createRes.json()).data;

		// 2. Get by ID
		const getRes = await app.request(`/api/datasets/${id}`);
		const ds = (await getRes.json()).data;
		expect(ds.name).toBe("Lifecycle Dataset");
		expect(ds.tags).toEqual(["lifecycle", "test"]);
		expect(ds.format).toBe("csv");
		expect(ds.active).toBe(true);

		// 3. Appears in search
		const searchRes = await app.request("/api/datasets/search?q=Lifecycle");
		const found = (await searchRes.json()).data.datasets;
		expect(found.some((d: { id: string }) => d.id === id)).toBe(true);

		// 4. Appears in category filter
		const catRes = await app.request("/api/datasets?category=finance");
		const catData = (await catRes.json()).data.datasets;
		expect(catData.some((d: { id: string }) => d.id === id)).toBe(true);

		// 5. Stats updated
		const statsRes = await app.request("/api/stats");
		const stats = (await statsRes.json()).data;
		expect(stats.totalDatasets).toBeGreaterThan(0);
	});
});
