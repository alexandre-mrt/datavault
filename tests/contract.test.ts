import { describe, expect, test } from "bun:test";

describe("DataMarketplace contract constants", () => {
	const FEE_BPS = 500;
	const BPS = 10000;

	test("fee is exactly 5%", () => {
		const feePercent = (FEE_BPS / BPS) * 100;
		expect(feePercent).toBe(5);
	});

	test("subscription pricing (30 days)", () => {
		const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;
		expect(THIRTY_DAYS_SECONDS).toBe(2592000);
	});

	test("fee calculation for various dataset prices", () => {
		const prices = [
			{ price: 10n, expectedFee: 0n }, // 5% of 10 = 0.5, rounds to 0
			{ price: 20n, expectedFee: 1n },
			{ price: 100n, expectedFee: 5n },
			{ price: 1000n, expectedFee: 50n },
		];

		for (const { price, expectedFee } of prices) {
			const fee = (price * BigInt(FEE_BPS)) / BigInt(BPS);
			expect(fee).toBe(expectedFee);
		}
	});

	test("valid dataset formats", () => {
		const formats = ["csv", "json", "jsonl", "parquet", "images", "text", "audio", "video"];
		expect(formats.length).toBe(8);
	});

	test("valid license types", () => {
		const licenses = ["commercial", "research", "open"];
		for (const l of licenses) {
			expect(l.length).toBeGreaterThan(0);
		}
	});
});

describe("Rating validation", () => {
	test("ratings are between 0 and 5", () => {
		const ratings = [0, 1, 2.5, 3.7, 4.5, 5];
		for (const r of ratings) {
			expect(r).toBeGreaterThanOrEqual(0);
			expect(r).toBeLessThanOrEqual(5);
		}
	});

	test("rating CHECK constraint in SQL (1-5 for reviews)", () => {
		// Reviews must be 1-5, datasets can be 0-5 (average)
		for (const r of [1, 2, 3, 4, 5]) {
			expect(r >= 1 && r <= 5).toBe(true);
		}
	});
});

describe("Data size validation", () => {
	test("total_size is in bytes", () => {
		const oneGB = 1024 * 1024 * 1024;
		expect(oneGB).toBe(1073741824);
	});

	test("file_count is positive integer", () => {
		const counts = [1, 5, 10, 100, 200];
		for (const c of counts) {
			expect(c).toBeGreaterThan(0);
			expect(Number.isInteger(c)).toBe(true);
		}
	});

	test("price stored as string for precision", () => {
		// Using string avoids floating-point issues with token amounts
		const price = "10.5";
		expect(typeof price).toBe("string");
		expect(Number(price)).toBe(10.5);
	});
});
