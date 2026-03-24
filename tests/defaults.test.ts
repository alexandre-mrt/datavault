import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");

const app = new Hono();
app.route("/api", apiRouter);

describe("Dataset creation defaults", () => {
	test("defaults category to general", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xdef",
				name: "Default Cat",
				rootHash: "0xhash",
				price: "5",
			}),
		});
		const { id } = (await res.json()).data;
		const ds = (await (await app.request(`/api/datasets/${id}`)).json()).data;
		expect(ds.category).toBe("general");
	});

	test("defaults format to csv", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xfmt",
				name: "Default Fmt",
				rootHash: "0xhash2",
				price: "3",
			}),
		});
		const { id } = (await res.json()).data;
		const ds = (await (await app.request(`/api/datasets/${id}`)).json()).data;
		expect(ds.format).toBe("csv");
	});

	test("defaults license to commercial", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xlic",
				name: "Default Lic",
				rootHash: "0xhash3",
				price: "1",
			}),
		});
		const { id } = (await res.json()).data;
		const ds = (await (await app.request(`/api/datasets/${id}`)).json()).data;
		expect(ds.license).toBe("commercial");
	});

	test("defaults tags to empty array", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				seller: "0xtag",
				name: "No Tags",
				rootHash: "0xhash4",
				price: "2",
			}),
		});
		const { id } = (await res.json()).data;
		const ds = (await (await app.request(`/api/datasets/${id}`)).json()).data;
		expect(ds.tags).toEqual([]);
	});
});
