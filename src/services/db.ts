import { Database } from "bun:sqlite";

export const db = new Database("./data/datavault.db", { create: true });
db.exec("PRAGMA journal_mode = WAL");

export function initializeDatabase() {
	db.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      seller TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT NOT NULL DEFAULT '[]',
      root_hash TEXT NOT NULL,
      sample_root_hash TEXT,
      file_count INTEGER NOT NULL DEFAULT 1,
      total_size INTEGER NOT NULL DEFAULT 0,
      format TEXT NOT NULL DEFAULT 'csv',
      price TEXT NOT NULL DEFAULT '0',
      subscription_price TEXT,
      license TEXT NOT NULL DEFAULT 'commercial',
      sales INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL REFERENCES datasets(id),
      buyer TEXT NOT NULL,
      amount TEXT NOT NULL,
      tx_hash TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL REFERENCES datasets(id),
      reviewer TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_datasets_category ON datasets(category);
    CREATE INDEX IF NOT EXISTS idx_datasets_active ON datasets(active);
    CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer);

    INSERT OR IGNORE INTO datasets (id, seller, name, description, category, tags, root_hash, file_count, total_size, format, price, license, sales, rating)
    VALUES
      ('demo-1', '0xDemo1', 'Crypto Price History 2020-2026', 'Complete hourly price data for top 100 cryptocurrencies. Includes OHLCV data, market cap, and volume.', 'finance', '["crypto","prices","historical","ohlcv"]', '0xdemo_hash_1', 100, 2147483648, 'csv', '5', 'commercial', 47, 4.5),
      ('demo-2', '0xDemo2', 'Ethereum Transaction Dataset', 'Full Ethereum mainnet transaction data including smart contract interactions, token transfers, and gas analytics.', 'blockchain', '["ethereum","transactions","defi","analytics"]', '0xdemo_hash_2', 50, 10737418240, 'parquet', '25', 'research', 23, 4.8),
      ('demo-3', '0xDemo3', 'Multilingual NLP Training Corpus', 'Curated text dataset in 50 languages for training language models. Cleaned and deduplicated.', 'nlp', '["nlp","text","multilingual","training"]', '0xdemo_hash_3', 200, 53687091200, 'jsonl', '50', 'open', 89, 4.2),
      ('demo-4', '0xDemo4', 'DeFi Protocol Analytics', 'TVL, yields, and risk metrics for 500+ DeFi protocols across 20 chains. Updated daily.', 'finance', '["defi","analytics","yields","risk"]', '0xdemo_hash_4', 20, 1073741824, 'json', '10', 'commercial', 156, 4.7);
  `);
}

export interface DatasetRow {
	id: string;
	seller: string;
	name: string;
	description: string;
	category: string;
	tags: string;
	root_hash: string;
	sample_root_hash: string | null;
	file_count: number;
	total_size: number;
	format: string;
	price: string;
	subscription_price: string | null;
	license: string;
	sales: number;
	rating: number;
	active: number;
	created_at: number;
}

export const queries = {
	listDatasets: db.prepare<DatasetRow, [number, number]>(
		"SELECT * FROM datasets WHERE active = 1 ORDER BY sales DESC, created_at DESC LIMIT ? OFFSET ?",
	),

	listByCategory: db.prepare<DatasetRow, [string, number, number]>(
		"SELECT * FROM datasets WHERE active = 1 AND category = ? ORDER BY sales DESC LIMIT ? OFFSET ?",
	),

	getDataset: db.prepare<DatasetRow, [string]>(
		"SELECT * FROM datasets WHERE id = ?",
	),

	searchDatasets: db.prepare<DatasetRow, [string, string, number, number]>(
		"SELECT * FROM datasets WHERE active = 1 AND (name LIKE ? OR description LIKE ?) ORDER BY sales DESC LIMIT ? OFFSET ?",
	),

	insertDataset: db.prepare(
		`INSERT INTO datasets (id, seller, name, description, category, tags, root_hash, sample_root_hash, file_count, total_size, format, price, subscription_price, license)
     VALUES ($id, $seller, $name, $description, $category, $tags, $rootHash, $sampleRootHash, $fileCount, $totalSize, $format, $price, $subscriptionPrice, $license)`,
	),

	countActive: db.prepare<{ count: number }, []>(
		"SELECT COUNT(*) as count FROM datasets WHERE active = 1",
	),

	stats: db.prepare<{ total: number; total_sales: number }, []>(
		"SELECT COUNT(*) as total, COALESCE(SUM(sales), 0) as total_sales FROM datasets",
	),
};
