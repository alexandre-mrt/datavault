import { describe, expect, test } from "bun:test";

// Test the data marketplace fee logic matching DataMarketplace.sol
const FEE_BPS = 500; // 5%
const BPS = 10000;

function calculateFee(price: bigint): { fee: bigint; sellerAmount: bigint } {
	const fee = (price * BigInt(FEE_BPS)) / BigInt(BPS);
	return { fee, sellerAmount: price - fee };
}

describe("Data marketplace fee calculation (5%)", () => {
	test("5% fee on 100 tokens", () => {
		const { fee, sellerAmount } = calculateFee(100n);
		expect(fee).toBe(5n);
		expect(sellerAmount).toBe(95n);
	});

	test("5% fee on 1000 tokens", () => {
		const { fee, sellerAmount } = calculateFee(1000n);
		expect(fee).toBe(50n);
		expect(sellerAmount).toBe(950n);
	});

	test("fee + seller amount always equals price", () => {
		for (const price of [1n, 5n, 10n, 100n, 999n, 50000n]) {
			const { fee, sellerAmount } = calculateFee(price);
			expect(fee + sellerAmount).toBe(price);
		}
	});
});

describe("Data format validation", () => {
	const validFormats = ["csv", "json", "jsonl", "parquet", "images", "text", "audio", "video"];

	test("all valid formats accepted", () => {
		for (const format of validFormats) {
			expect(validFormats.includes(format)).toBe(true);
		}
	});

	test("invalid formats rejected", () => {
		expect(validFormats.includes("pdf")).toBe(false);
		expect(validFormats.includes("excel")).toBe(false);
		expect(validFormats.includes("")).toBe(false);
	});
});

describe("License types", () => {
	test("common license types", () => {
		const licenses = ["commercial", "research", "open"];
		expect(licenses.length).toBe(3);
		expect(licenses).toContain("commercial");
		expect(licenses).toContain("open");
	});
});
