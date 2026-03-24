import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Create response", () => {
	test("returns 201 with id", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ seller: "0xs", name: "R", rootHash: "0xh", price: "1" }),
		});
		expect(res.status).toBe(201);
		expect(typeof (await res.json()).data.id).toBe("string");
	});

	test("id has reasonable length", async () => {
		const res = await app.request("/api/datasets", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ seller: "0xs", name: "R2", rootHash: "0xh2", price: "2" }),
		});
		const id = (await res.json()).data.id;
		expect(id.length).toBeGreaterThan(5);
		expect(id.length).toBeLessThan(30);
	});
});
