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
		expect(json.data.datasets.length).toBeGreaterThanOrEqual(4); // demo seed data
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

describe("Dataset object shape", () => {
	test("datasets have all expected fields", async () => {
		const res = await app.request("/api/datasets/demo-1");
		const json = await res.json();
		const ds = json.data;
		expect(ds).toHaveProperty("id");
		expect(ds).toHaveProperty("name");
		expect(ds).toHaveProperty("description");
		expect(ds).toHaveProperty("category");
		expect(ds).toHaveProperty("tags");
		expect(ds).toHaveProperty("rootHash");
		expect(ds).toHaveProperty("fileCount");
		expect(ds).toHaveProperty("totalSize");
		expect(ds).toHaveProperty("format");
		expect(ds).toHaveProperty("price");
		expect(ds).toHaveProperty("license");
		expect(ds).toHaveProperty("sales");
		expect(ds).toHaveProperty("rating");
		expect(ds).toHaveProperty("active");
		expect(Array.isArray(ds.tags)).toBe(true);
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

	test("rejects invalid price", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xseller",
				name: "Test",
				rootHash: "0xhash",
				price: "free",
			}),
		});
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toContain("Price");
	});

	test("rejects invalid seller address", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "not_an_address",
				name: "Test",
				rootHash: "0xhash",
				price: "10",
			}),
		});
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toContain("address");
	});

	test("rejects invalid format", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xseller",
				name: "Test",
				rootHash: "0xhash",
				price: "10",
				format: "invalid_format",
			}),
		});
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toContain("format");
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

	test("stats counts are consistent", async () => {
		const res = await app.request("/api/stats");
		const json = await res.json();
		expect(json.data.activeDatasets).toBeLessThanOrEqual(json.data.totalDatasets);
	});
});

describe("Create and retrieve round-trip", () => {
	test("created dataset is retrievable by ID", async () => {
		const createRes = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xroundtrip",
				name: "Round Trip Dataset",
				description: "Testing create + get",
				category: "nlp",
				tags: ["round", "trip"],
				rootHash: "0xroundtriphash",
				format: "jsonl",
				price: "15",
				license: "open",
			}),
		});
		const created = await createRes.json();
		const id = created.data.id;

		const getRes = await app.request(`/api/datasets/${id}`);
		expect(getRes.status).toBe(200);
		const ds = (await getRes.json()).data;
		expect(ds.name).toBe("Round Trip Dataset");
		expect(ds.category).toBe("nlp");
		expect(ds.tags).toEqual(["round", "trip"]);
		expect(ds.format).toBe("jsonl");
		expect(ds.price).toBe("15");
		expect(ds.license).toBe("open");
		expect(ds.active).toBe(true);
	});

	test("created dataset appears in search", async () => {
		const res = await app.request("/api/datasets/search?q=Round+Trip");
		const json = await res.json();
		expect(json.data.datasets.length).toBeGreaterThanOrEqual(1);
		const found = json.data.datasets.find((d: { name: string }) => d.name === "Round Trip Dataset");
		expect(found).toBeTruthy();
	});
});

describe("Error response format", () => {
	test("404 returns success:false with error message", async () => {
		const res = await app.request("/api/datasets/nonexistent");
		expect(res.status).toBe(404);
		const json = await res.json();
		expect(json.success).toBe(false);
		expect(json).toHaveProperty("error");
	});

	test("400 returns descriptive error", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		const json = await res.json();
		expect(json.success).toBe(false);
		expect(json.error.length).toBeGreaterThan(5);
	});
});

describe("Demo data integrity", () => {
	test("demo datasets have valid ratings", async () => {
		const res = await app.request("/api/datasets");
		const json = await res.json();
		for (const ds of json.data.datasets) {
			expect(ds.rating).toBeGreaterThanOrEqual(0);
			expect(ds.rating).toBeLessThanOrEqual(5);
		}
	});

	test("demo datasets have positive sales", async () => {
		const res = await app.request("/api/datasets/demo-1");
		const json = await res.json();
		expect(json.data.sales).toBeGreaterThan(0);
	});
});
