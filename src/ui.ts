import type { DatasetRow } from "./services/db";

function esc(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#0a0a0a; color:#e5e5e5; }
a { color:inherit; text-decoration:none; }
.header { border-bottom:1px solid #1a1a1a; padding:1rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.header h1 { font-size:1.25rem; font-weight:800; color:#10b981; }
.header nav { display:flex; gap:1.5rem; }
.header nav a { color:#737373; font-size:0.875rem; }
.header nav a:hover { color:#e5e5e5; }
.hero { text-align:center; padding:3rem 2rem 1.5rem; }
.hero h2 { font-size:2.25rem; font-weight:800; }
.hero p { color:#737373; max-width:480px; margin:0.5rem auto 0; }
.search { max-width:500px; margin:1.5rem auto; display:flex; gap:0.5rem; padding:0 2rem; }
.search input { flex:1; background:#1a1a1a; border:1px solid #333; border-radius:0.5rem; padding:0.625rem 1rem; color:#e5e5e5; font-size:0.875rem; }
.search button { background:#10b981; color:white; border:none; border-radius:0.5rem; padding:0.625rem 1.25rem; font-weight:600; cursor:pointer; }
.cats { display:flex; gap:0.5rem; justify-content:center; padding:0.5rem 2rem 1.5rem; flex-wrap:wrap; }
.cats a { padding:0.25rem 0.875rem; border-radius:2rem; font-size:0.75rem; background:#1a1a1a; color:#a3a3a3; }
.cats a:hover,.cats a.active { background:#10b981; color:white; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.25rem; padding:0 2rem 2rem; max-width:1200px; margin:0 auto; }
.card { background:#141414; border:1px solid #1f1f1f; border-radius:0.75rem; padding:1.25rem; transition:border-color 0.2s; }
.card:hover { border-color:#333; }
.card h3 { font-size:1rem; font-weight:600; margin-bottom:0.25rem; }
.card .desc { font-size:0.8rem; color:#737373; line-height:1.4; margin-bottom:0.75rem; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.card .meta { display:flex; gap:0.75rem; font-size:0.75rem; color:#525252; margin-bottom:0.75rem; }
.card .tags { display:flex; gap:0.25rem; flex-wrap:wrap; margin-bottom:0.75rem; }
.card .tag { font-size:0.625rem; padding:0.125rem 0.5rem; border-radius:1rem; background:#1a2e1a; color:#4ade80; }
.card .foot { display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid #1f1f1f; }
.card .price { font-weight:700; color:#10b981; font-size:1.125rem; }
.card .rating { color:#f59e0b; font-size:0.75rem; }
.detail { max-width:800px; margin:0 auto; padding:2rem; }
.detail h2 { font-size:1.75rem; font-weight:800; }
.btn { display:inline-block; background:#10b981; color:white; border:none; border-radius:0.5rem; padding:0.75rem 2rem; font-size:1rem; font-weight:600; cursor:pointer; width:100%; text-align:center; margin-top:1rem; }
.empty { text-align:center; padding:4rem; color:#525252; }
`;

function layout(title: string, body: string): string {
	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${esc(title)} | DataVault</title><style>${CSS}</style></head><body>
<header class="header"><a href="/"><h1>DataVault</h1></a><nav><a href="/">Browse</a><a href="/sell">Sell Data</a></nav></header>
${body}</body></html>`;
}

const CATEGORIES = [
	{ id: "finance", name: "Finance" },
	{ id: "blockchain", name: "Blockchain" },
	{ id: "nlp", name: "NLP / Text" },
	{ id: "vision", name: "Computer Vision" },
	{ id: "audio", name: "Audio" },
	{ id: "health", name: "Healthcare" },
	{ id: "general", name: "General" },
];

export function homePage(datasets: DatasetRow[], activeCategory?: string): string {
	const cards = datasets.map((d) => {
		const tags = JSON.parse(d.tags) as string[];
		return `<a href="/dataset/${d.id}" class="card">
	<h3>${esc(d.name)}</h3>
	<p class="desc">${esc(d.description)}</p>
	<div class="meta">
		<span>${d.file_count} files</span><span>${formatBytes(d.total_size)}</span>
		<span>${d.format.toUpperCase()}</span><span>${d.sales} sales</span>
	</div>
	<div class="tags">${tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
	<div class="foot">
		<span class="price">${d.price} 0G</span>
		<span class="rating">${stars(d.rating)} ${d.rating.toFixed(1)}</span>
	</div>
</a>`;
	}).join("");

	const catLinks = CATEGORIES.map(
		(c) => `<a href="/?category=${c.id}" class="${activeCategory === c.id ? "active" : ""}">${c.name}</a>`,
	).join("");

	return layout("Data Marketplace", `
<div class="hero"><h2>Data Marketplace</h2><p>Buy and sell datasets for AI training on 0G decentralized storage</p></div>
<div class="search"><input type="text" placeholder="Search datasets..." id="q" /><button onclick="location.href='/search?q='+document.getElementById('q').value">Search</button></div>
<div class="cats"><a href="/" class="${!activeCategory ? "active" : ""}">All</a>${catLinks}</div>
<div class="grid">${cards || '<div class="empty">No datasets yet</div>'}</div>`);
}

export function datasetPage(d: DatasetRow): string {
	const tags = JSON.parse(d.tags) as string[];
	return layout(d.name, `
<div class="detail">
	<h2>${esc(d.name)}</h2>
	<div style="color:#737373;margin:0.5rem 0 1.5rem;font-size:0.875rem">
		${d.category} | ${d.format.toUpperCase()} | ${formatBytes(d.total_size)} | ${d.file_count} files | ${d.sales} sales
		<span style="color:#f59e0b;margin-left:0.5rem">${stars(d.rating)} ${d.rating.toFixed(1)}</span>
	</div>
	<div style="margin-bottom:1.5rem">
		<h3 style="font-size:0.875rem;color:#525252;text-transform:uppercase;margin-bottom:0.5rem">Description</h3>
		<p style="color:#a3a3a3;line-height:1.6">${esc(d.description)}</p>
	</div>
	<div style="margin-bottom:1.5rem">
		<h3 style="font-size:0.875rem;color:#525252;text-transform:uppercase;margin-bottom:0.5rem">Tags</h3>
		<div style="display:flex;gap:0.5rem;flex-wrap:wrap">${tags.map((t) => `<span class="tag" style="font-size:0.75rem;padding:0.25rem 0.75rem">${esc(t)}</span>`).join("")}</div>
	</div>
	<div style="margin-bottom:1.5rem">
		<h3 style="font-size:0.875rem;color:#525252;text-transform:uppercase;margin-bottom:0.5rem">Details</h3>
		<p style="color:#525252;font-size:0.875rem">License: ${esc(d.license)}<br/>0G Root Hash: ${esc(d.root_hash)}<br/>Seller: ${esc(d.seller)}</p>
	</div>
	<div style="background:#141414;border:1px solid #1f1f1f;border-radius:0.75rem;padding:1.5rem;text-align:center">
		<div style="font-size:2.5rem;font-weight:800;color:#10b981">${d.price} 0G</div>
		${d.subscription_price ? `<div style="color:#737373;font-size:0.875rem">or ${d.subscription_price} 0G/month subscription</div>` : ""}
		<button class="btn" onclick="alert('Connect wallet via MetaMask to purchase. Smart contract required.')">Purchase Dataset</button>
		<p style="font-size:0.75rem;color:#525252;margin-top:0.5rem">5% marketplace fee</p>
	</div>
</div>`);
}

export function sellPage(): string {
	return layout("Sell Data", `
<div class="detail">
	<h2>Sell Your Dataset</h2>
	<p style="color:#737373;margin-bottom:2rem">List your dataset on DataVault and earn 0G tokens</p>
	<form id="form" style="display:flex;flex-direction:column;gap:1rem">
		<input name="name" required placeholder="Dataset name" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5" />
		<textarea name="description" rows="3" required placeholder="Description" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5;resize:vertical"></textarea>
		<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
			<input name="rootHash" required placeholder="0G Storage root hash" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5" />
			<input name="price" required placeholder="Price (0G tokens)" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5" />
		</div>
		<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
			<select name="category" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5">
				${CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
			</select>
			<select name="format" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5">
				<option>csv</option><option>json</option><option>jsonl</option><option>parquet</option><option>images</option><option>text</option>
			</select>
		</div>
		<input name="tags" placeholder="Tags (comma-separated)" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5" />
		<input name="seller" required placeholder="Your wallet address (0x...)" style="background:#1a1a1a;border:1px solid #333;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5" />
		<button type="submit" class="btn">List Dataset</button>
	</form>
	<div id="result" style="display:none;margin-top:1rem;background:#1a2e1a;border:1px solid #2a5a2a;border-radius:0.75rem;padding:1rem">
		<p style="color:#4ade80" id="msg"></p>
	</div>
</div>
<script>
document.getElementById('form').addEventListener('submit',async e=>{
	e.preventDefault();
	const d=Object.fromEntries(new FormData(e.target));
	d.tags=d.tags?d.tags.split(',').map(s=>s.trim()):[];
	const r=await fetch('/api/datasets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
	const j=await r.json();
	document.getElementById('msg').textContent=j.success?'Listed! View at '+location.origin+'/dataset/'+j.data.id:'Error: '+j.error;
	document.getElementById('result').style.display='block';
});
</script>`);
}

export function searchPage(datasets: DatasetRow[], query: string): string {
	const cards = datasets.map((d) => {
		const tags = JSON.parse(d.tags) as string[];
		return `<a href="/dataset/${d.id}" class="card">
	<h3>${esc(d.name)}</h3>
	<p class="desc">${esc(d.description)}</p>
	<div class="tags">${tags.slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
	<div class="foot"><span class="price">${d.price} 0G</span><span class="rating">${stars(d.rating)}</span></div>
</a>`;
	}).join("");

	return layout(`Search: ${query}`, `
<div style="max-width:1200px;margin:0 auto;padding:2rem">
	<h2>Search results for "${esc(query)}"</h2>
	<p style="color:#737373;margin-bottom:1.5rem">${datasets.length} results</p>
	<div class="grid">${cards || '<div class="empty">No results found</div>'}</div>
</div>`);
}

export function errorPage(msg: string): string {
	return layout("Error", `<div class="empty"><p>${esc(msg)}</p><a href="/" class="btn" style="width:auto;display:inline-block;padding:0.5rem 2rem;margin-top:1rem">Back</a></div>`);
}
