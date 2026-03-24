# DataVault

**Decentralized Data Marketplace on 0G Storage.**

Buy and sell datasets for AI training, analytics, and research. Data is stored on [0G decentralized storage](https://0g.ai), ensuring availability, integrity, and censorship resistance.

## Features

- **Browse datasets** - Filter by category (Finance, Blockchain, NLP, Vision, Audio, Healthcare)
- **Search** - Full-text search across names and descriptions
- **Dataset detail pages** - File count, size, format, rating, tags, license
- **Sell data** - List your datasets with pricing and metadata
- **Buy access** - One-time purchase or monthly subscription
- **Smart contract** - On-chain payments with 5% marketplace fee
- **Reviews & ratings** - Community-driven quality signals

## Quick Start

```bash
git clone https://github.com/alexandre-mrt/datavault.git
cd datavault
cp .env.example .env
bun install
mkdir -p data
bun run dev
```

Open `http://localhost:3000` - comes pre-seeded with demo datasets.

## Smart Contract

`DataMarketplace.sol`:
- `listDataset()` - List a dataset with root hash and pricing
- `purchase()` - Buy perpetual access (5% fee)
- `subscribe()` - Monthly subscription access
- `hasAccess()` - Check if user has access

Deploy to 0G:
- **Testnet:** `https://evmrpc-testnet.0g.ai` | Chain ID `16602`
- **Mainnet:** `https://evmrpc.0g.ai` | Chain ID `16661`

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/datasets` | List datasets (paginated, filterable) |
| `GET` | `/api/datasets/search?q=` | Search datasets |
| `GET` | `/api/datasets/:id` | Dataset details |
| `POST` | `/api/datasets` | List new dataset |
| `GET` | `/api/stats` | Marketplace statistics |

## Revenue Model

- **5% marketplace fee** on every dataset purchase/subscription
- **Featured listings** ($25/week for homepage promotion)
- **API access** ($49/mo for programmatic marketplace access)

## Part of the 0G Ecosystem

- [ZeroStore](https://github.com/alexandre-mrt/zerostorage) - Storage Gateway API
- [0G Agent Kit](https://github.com/alexandre-mrt/0g-agent-kit) - AI Agent SDK
- [ZeroDrop](https://github.com/alexandre-mrt/zerodrop) - File Sharing
- [AgentBazaar](https://github.com/alexandre-mrt/agentbazaar) - AI Agent Marketplace

## License

MIT
