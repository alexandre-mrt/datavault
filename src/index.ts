import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiRouter } from "./routes/api";
import { initializeDatabase, queries } from "./services/db";
import { datasetPage, errorPage, homePage, searchPage, sellPage } from "./ui";

initializeDatabase();

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.onError((err, c) => {
	console.error(`Unhandled error: ${err.message}`);
	return c.json({ success: false, error: "Internal server error" }, 500);
});

app.route("/api", apiRouter);

app.get("/", (c) => {
	const category = c.req.query("category");
	const datasets = category
		? queries.listByCategory.all(category, 20, 0)
		: queries.listDatasets.all(20, 0);
	return c.html(homePage(datasets, category || undefined));
});

app.get("/dataset/:id", (c) => {
	const ds = queries.getDataset.get(c.req.param("id"));
	if (!ds || !ds.active) return c.html(errorPage("Dataset not found"));
	return c.html(datasetPage(ds));
});

app.get("/sell", (c) => c.html(sellPage()));

app.get("/search", (c) => {
	const q = c.req.query("q") || "";
	const pattern = `%${q}%`;
	const results = queries.searchDatasets.all(pattern, pattern, 20, 0);
	return c.html(searchPage(results, q));
});

app.get("/health", (c) => c.json({ status: "ok" }));

const PORT = Number(process.env.PORT || 3000);
console.log(`DataVault running on http://localhost:${PORT}`);

export default { port: PORT, fetch: app.fetch };
