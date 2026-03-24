import { describe, expect, test } from "bun:test";

describe("Package metadata", () => {
	test("has required fields", () => {
		const pkg = require("../package.json");
		expect(pkg.name).toBe("datavault");
		expect(pkg.scripts).toHaveProperty("dev");
		expect(pkg.scripts).toHaveProperty("build");
	});
});
