import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = ":memory:";
const { queries } = await import("../src/services/db");

describe("Dataset field defaults", () => {
	test("sales default to 0", () => {
		queries.insertDataset.run({
			$id: "def-ds", $seller: "0xs", $name: "D", $description: "",
			$category: "general", $tags: "[]", $rootHash: "0xh",
			$sampleRootHash: null, $fileCount: 1, $totalSize: 100,
			$format: "csv", $price: "1", $subscriptionPrice: null, $license: "open",
		});
		const ds = queries.getDataset.get("def-ds");
		expect(ds!.sales).toBe(0);
		expect(ds!.rating).toBe(0);
		expect(ds!.active).toBe(1);
	});
});
