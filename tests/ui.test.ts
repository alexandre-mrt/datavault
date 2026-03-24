import { describe, expect, test } from "bun:test";
import { homePage, datasetPage, sellPage, searchPage, errorPage } from "../src/ui";
import type { DatasetRow } from "../src/services/db";

const mockDataset: DatasetRow = {
	id: "ds-1",
	seller: "0xabc123",
	name: "Test Dataset",
	description: "A test dataset for unit tests",
	category: "finance",
	tags: '["test","data"]',
	root_hash: "0xhash123",
	sample_root_hash: null,
	file_count: 10,
	total_size: 1073741824, // 1 GB
	format: "csv",
	price: "15",
	subscription_price: null,
	license: "commercial",
	sales: 42,
	rating: 4.5,
	active: 1,
	created_at: 1711234567,
};

describe("UI - homePage", () => {
	test("renders datasets", () => {
		const page = homePage([mockDataset]);
		expect(page).toContain("DataVault");
		expect(page).toContain("Test Dataset");
		expect(page).toContain("15 0G");
		expect(page).toContain("42 sales");
	});

	test("renders empty state", () => {
		const page = homePage([]);
		expect(page).toContain("DataVault");
		expect(page).toContain("No datasets yet");
	});

	test("highlights active category", () => {
		const page = homePage([], "finance");
		expect(page).toContain('class="active"');
	});
});

describe("UI - datasetPage", () => {
	test("renders dataset details", () => {
		const page = datasetPage(mockDataset);
		expect(page).toContain("Test Dataset");
		expect(page).toContain("A test dataset for unit tests");
		expect(page).toContain("15");
		expect(page).toContain("CSV");
		expect(page).toContain("commercial");
	});

	test("shows subscription price when set", () => {
		const withSub = { ...mockDataset, subscription_price: "5" };
		const page = datasetPage(withSub);
		expect(page).toContain("5 0G/month");
	});
});

describe("UI - sellPage", () => {
	test("renders sell form", () => {
		const page = sellPage();
		expect(page).toContain("Sell Your Dataset");
		expect(page).toContain("form");
		expect(page).toContain("price");
		expect(page).toContain("rootHash");
	});
});

describe("UI - searchPage", () => {
	test("renders search results", () => {
		const page = searchPage([mockDataset], "test");
		expect(page).toContain("test");
		expect(page).toContain("Test Dataset");
		expect(page).toContain("1 results");
	});

	test("renders empty search", () => {
		const page = searchPage([], "nothing");
		expect(page).toContain("No results found");
	});
});

describe("UI - errorPage", () => {
	test("renders error message", () => {
		const page = errorPage("Dataset not found");
		expect(page).toContain("Dataset not found");
	});
});

describe("XSS prevention", () => {
	test("escapes dataset name", () => {
		const xss = { ...mockDataset, name: '<script>alert(1)</script>' };
		const page = datasetPage(xss);
		expect(page).toContain("&lt;script&gt;");
	});
});
