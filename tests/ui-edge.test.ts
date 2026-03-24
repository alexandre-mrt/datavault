import { describe, expect, test } from "bun:test";
import { homePage, errorPage, sellPage } from "../src/ui";

describe("UI edge cases", () => {
	test("home page renders with empty dataset list", () => {
		const page = homePage([]);
		expect(page).toContain("DataVault");
		expect(page).toContain("No datasets yet");
	});

	test("sell page has all required form fields", () => {
		const page = sellPage();
		expect(page).toContain("Sell Your Dataset");
		expect(page).toContain("name");
		expect(page).toContain("rootHash");
		expect(page).toContain("price");
		expect(page).toContain("seller");
		expect(page).toContain("category");
		expect(page).toContain("format");
	});

	test("error page XSS protection", () => {
		const page = errorPage('<img onerror="alert(1)">');
		expect(page).not.toContain('<img onerror');
		expect(page).toContain("&lt;img");
	});
});
