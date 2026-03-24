import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

process.env.DATABASE_URL = ":memory:";
const { apiRouter } = await import("../src/routes/api");
const app = new Hono();
app.route("/api", apiRouter);

describe("Concurrent operations", () => {
	test("parallel dataset creation", async () => {
		const promises = Array.from({ length: 10 }, (_, i) =>
			app.request("/api/datasets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					seller: "0xseller",
					name: `ParallelDS-${i}`,
					rootHash: `0xp${i}`,
					price: "5",
				}),
			}),
		);

		const results = await Promise.all(promises);
		for (const res of results) {
			expect(res.status).toBe(201);
		}
	});
});
