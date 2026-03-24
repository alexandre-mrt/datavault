# DataVault

## Overview
Decentralized data marketplace on 0G. Buy and sell datasets for AI training.
Server-rendered HTML UI with Hono API. 5% marketplace fee via smart contract.

## Structure
```
src/
  index.ts          - Server + frontend + error handler
  ui.ts             - HTML templates (XSS-safe)
  routes/api.ts     - REST API with validation
  services/db.ts    - Bun SQLite (auto-init, seeded with 4 demo datasets)
contracts/
  DataMarketplace.sol - Smart contract (5% fee, subscriptions)
```

## Stack
- Runtime: Bun
- Framework: Hono
- DB: Bun SQLite
- Smart Contract: Solidity ^0.8.19
- CI: GitHub Actions
- Tests: 97 tests via bun test

## Commands
- `bun install && mkdir -p data` - Setup
- `bun run dev` - Start dev server
- `bun test` - Run all 97 tests

## Key Routes
- `GET /` - Browse datasets
- `GET /dataset/:id` - Dataset detail
- `GET /sell` - List dataset form
- `GET /search?q=` - Search
- `POST /api/datasets` - Create listing (validated)
- `GET /api/datasets` - List (paginated, filterable)
- `GET /api/datasets/count` - Active count
- `GET /api/datasets/search?q=` - Search
- `GET /api/stats` - Marketplace stats

## Demo data
DB seeded with 4 datasets: Crypto prices, Ethereum txs, NLP corpus, DeFi analytics.
