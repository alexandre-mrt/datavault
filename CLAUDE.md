# DataVault

## Overview
Decentralized data marketplace on 0G. Buy and sell datasets for AI training.
Server-rendered HTML UI with Hono API. 5% marketplace fee via smart contract.

## Structure
```
src/
  index.ts          - Server + routes
  ui.ts             - HTML templates
  routes/api.ts     - REST API
  services/db.ts    - SQLite (seeded with demo data)
contracts/
  DataMarketplace.sol - Marketplace smart contract
```

## Stack
Bun, Hono, SQLite, ethers v6, 0G Storage SDK

## Commands
- `bun install && mkdir -p data && bun run dev`

## Demo data
DB is seeded with 4 demo datasets on first run.
