import { describe, expect, test } from "bun:test";
import { homePage, sellPage, errorPage } from "../src/ui";

describe("HTML document structure", () => {
	test("all pages close tags properly", () => {
		const pages = [homePage([]), sellPage(), errorPage("test")];
		for (const page of pages) {
			expect(page).toContain("</html>");
			expect(page).toContain("</body>");
		}
	});

	test("pages have charset", () => {
		const page = homePage([]);
		expect(page).toContain("UTF-8");
	});
});
