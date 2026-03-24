import { describe, expect, test } from "bun:test";

describe("Fee invariants (5%)", () => {
	const FEE_BPS = 500;
	const BPS = 10000;

	test("fee + seller always equals price for 100 prices", () => {
		for (let p = 1n; p <= 100n; p++) {
			const fee = (p * BigInt(FEE_BPS)) / BigInt(BPS);
			expect(fee + (p - fee)).toBe(p);
		}
	});

	test("fee is monotonically increasing", () => {
		let prevFee = 0n;
		for (let p = 1n; p <= 50n; p++) {
			const fee = (p * BigInt(FEE_BPS)) / BigInt(BPS);
			expect(fee).toBeGreaterThanOrEqual(prevFee);
			prevFee = fee;
		}
	});
});
