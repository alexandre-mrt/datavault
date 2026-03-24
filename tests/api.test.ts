import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";

const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("GET /api/datasets", () => {
	test("returns seeded demo datasets", async () => {
		const res = await app.request("/api/datasets");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.success).toBe(true);
		expect(json.data.datasets.length).toBe(4); // demo seed data
	});

	test("filters by category", async () => {
		const res = await app.request("/api/datasets?category=finance");
		const json = await res.json();
		expect(json.data.datasets.length).toBe(2); // demo-1 and demo-4
		for (const ds of json.data.datasets) {
			expect(ds.category).toBe("finance");
		}
	});

	test("paginates correctly", async () => {
		const res = await app.request("/api/datasets?page=1&limit=2");
		const json = await res.json();
		expect(json.data.datasets.length).toBe(2);
		expect(json.data.page).toBe(1);
		expect(json.data.limit).toBe(2);
	});
});

describe("GET /api/datasets/:id", () => {
	test("returns demo dataset", async () => {
		const res = await app.request("/api/datasets/demo-1");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.name).toBe("Crypto Price History 2020-2026");
		expect(json.data.category).toBe("finance");
		expect(json.data.price).toBe("5");
		expect(json.data.tags).toContain("crypto");
	});

	test("returns 404 for nonexistent", async () => {
		const res = await app.request("/api/datasets/nonexistent");
		expect(res.status).toBe(404);
	});
});

describe("POST /api/datasets", () => {
	test("creates a dataset listing", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xtest",
				name: "New Dataset",
				description: "Test dataset",
				category: "nlp",
				tags: ["test", "new"],
				rootHash: "0xnewhash",
				fileCount: 5,
				totalSize: 1000000,
				format: "jsonl",
				price: "20",
				license: "open",
			}),
		});
		expect(res.status).toBe(201);
		const json = await res.json();
		expect(json.success).toBe(true);
		expect(json.data.id).toBeTruthy();
	});

	test("rejects missing required fields", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Incomplete" }),
		});
		expect(res.status).toBe(400);
	});
});

describe("GET /api/datasets/search", () => {
	test("finds datasets by name", async () => {
		const res = await app.request("/api/datasets/search?q=Crypto");
		const json = await res.json();
		expect(json.data.datasets.length).toBeGreaterThanOrEqual(1);
	});

	test("finds datasets by description", async () => {
		const res = await app.request("/api/datasets/search?q=DeFi");
		const json = await res.json();
		expect(json.data.datasets.length).toBeGreaterThanOrEqual(1);
	});

	test("returns empty for no match", async () => {
		const res = await app.request("/api/datasets/search?q=zzzzznothing");
		const json = await res.json();
		expect(json.data.datasets.length).toBe(0);
	});
});

describe("GET /api/stats", () => {
	test("returns marketplace stats", async () => {
		const res = await app.request("/api/stats");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.activeDatasets).toBeGreaterThan(0);
		expect(json.data.totalDatasets).toBeGreaterThan(0);
		expect(json.data.totalSales).toBeGreaterThan(0);
	});
});
