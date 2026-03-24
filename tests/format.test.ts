import { describe, expect, test } from "bun:test";

function formatBytes(b: number): string {
	if (b === 0) return "0 B";
	const k = 1024, s = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(b) / Math.log(k));
	return `${Number.parseFloat((b / k ** i).toFixed(1))} ${s[i]}`;
}

function stars(rating: number): string {
	const full = Math.floor(rating);
	const half = rating % 1 >= 0.5 ? 1 : 0;
	return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}

describe("formatBytes", () => {
	test("0 bytes", () => expect(formatBytes(0)).toBe("0 B"));
	test("1 GB", () => expect(formatBytes(1073741824)).toBe("1 GB"));
	test("10 GB", () => expect(formatBytes(10737418240)).toBe("10 GB"));
	test("50 GB", () => expect(formatBytes(53687091200)).toBe("50 GB"));
});

describe("stars rating", () => {
	test("5.0 = all full", () => expect(stars(5)).toBe("★★★★★"));
	test("0.0 = all empty", () => expect(stars(0)).toBe("☆☆☆☆☆"));
	test("4.5 = 4 full + half", () => expect(stars(4.5)).toBe("★★★★½"));
	test("3.7 = 3 full + half + 1 empty", () => expect(stars(3.7)).toBe("★★★½☆"));
	test("2.2 = 2 full + 3 empty", () => expect(stars(2.2)).toBe("★★☆☆☆"));
});
