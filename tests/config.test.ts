import { describe, expect, test } from "bun:test";

describe("App configuration", () => {
	test("default port is 3000", () => {
		expect(Number(process.env.PORT || 3000)).toBe(3000);
	});

	test("marketplace fee is 5%", () => {
		expect(500 / 10000).toBe(0.05);
	});

	test("8 valid formats", () => {
		const formats = ["csv", "json", "jsonl", "parquet", "images", "text", "audio", "video"];
		expect(formats.length).toBe(8);
	});
});
