import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { DatasetRow } from "../services/db";
import { queries } from "../services/db";

export const apiRouter = new Hono();

apiRouter.get("/datasets", (c) => {
	const page = Number(c.req.query("page") || "1");
	const limit = Math.min(Number(c.req.query("limit") || "20"), 50);
	const category = c.req.query("category");
	const offset = (page - 1) * limit;

	const datasets = category
		? queries.listByCategory.all(category, limit, offset)
		: queries.listDatasets.all(limit, offset);

	return c.json({ success: true, data: { datasets: datasets.map(formatDataset), page, limit } });
});

apiRouter.get("/datasets/search", (c) => {
	const q = c.req.query("q") || "";
	const page = Number(c.req.query("page") || "1");
	const limit = 20;
	const offset = (page - 1) * limit;
	const pattern = `%${q}%`;

	const datasets = queries.searchDatasets.all(pattern, pattern, limit, offset);
	return c.json({ success: true, data: { datasets: datasets.map(formatDataset), query: q } });
});

apiRouter.get("/datasets/:id", (c) => {
	const dataset = queries.getDataset.get(c.req.param("id"));
	if (!dataset) return c.json({ success: false, error: "Not found" }, 404);
	return c.json({ success: true, data: formatDataset(dataset) });
});

apiRouter.post("/datasets", async (c) => {
	const body = await c.req.json<{
		seller: string;
		name: string;
		description: string;
		category?: string;
		tags?: string[];
		rootHash: string;
		sampleRootHash?: string;
		fileCount?: number;
		totalSize?: number;
		format?: string;
		price: string;
		subscriptionPrice?: string;
		license?: string;
	}>();

	if (!body.name || !body.seller || !body.rootHash || !body.price) {
		return c.json({ success: false, error: "Missing required fields: name, seller, rootHash, price" }, 400);
	}

	if (body.name.trim().length === 0 || body.name.length > 300) {
		return c.json({ success: false, error: "Name must be 1-300 characters" }, 400);
	}

	if (Number.isNaN(Number(body.price)) || Number(body.price) <= 0) {
		return c.json({ success: false, error: "Price must be a positive number" }, 400);
	}

	if (!body.seller.startsWith("0x")) {
		return c.json({ success: false, error: "Seller must be a valid address (0x...)" }, 400);
	}

	const validFormats = ["csv", "json", "jsonl", "parquet", "images", "text", "audio", "video"];
	if (body.format && !validFormats.includes(body.format)) {
		return c.json({ success: false, error: `Invalid format. Must be one of: ${validFormats.join(", ")}` }, 400);
	}

	const id = nanoid();
	queries.insertDataset.run({
		$id: id,
		$seller: body.seller,
		$name: body.name,
		$description: body.description || "",
		$category: body.category || "general",
		$tags: JSON.stringify(body.tags || []),
		$rootHash: body.rootHash,
		$sampleRootHash: body.sampleRootHash || null,
		$fileCount: body.fileCount || 1,
		$totalSize: body.totalSize || 0,
		$format: body.format || "csv",
		$price: body.price,
		$subscriptionPrice: body.subscriptionPrice || null,
		$license: body.license || "commercial",
	});

	return c.json({ success: true, data: { id } }, 201);
});

apiRouter.get("/stats", (c) => {
	const stats = queries.stats.get();
	const active = queries.countActive.get();
	return c.json({
		success: true,
		data: {
			activeDatasets: active?.count ?? 0,
			totalDatasets: stats?.total ?? 0,
			totalSales: stats?.total_sales ?? 0,
		},
	});
});

function formatDataset(row: DatasetRow) {
	return {
		id: row.id,
		seller: row.seller,
		name: row.name,
		description: row.description,
		category: row.category,
		tags: JSON.parse(row.tags) as string[],
		rootHash: row.root_hash,
		sampleRootHash: row.sample_root_hash,
		fileCount: row.file_count,
		totalSize: row.total_size,
		format: row.format,
		price: row.price,
		subscriptionPrice: row.subscription_price,
		license: row.license,
		sales: row.sales,
		rating: row.rating,
		active: row.active === 1,
		createdAt: row.created_at,
	};
}
