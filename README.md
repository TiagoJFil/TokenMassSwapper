# TokenMassSwapper

A Cardano-based token trading api built with NestJS that enables mass token swapping operations across multiple wallets with advanced distribution strategies.

## Description

TokenMassSwapper is designed for multiple-chain currently only including Cardano ecosystem but futurely kaspa that allows users to execute large-scale token buy/sell operations across multiple replica wallets. The API provides intelligent distribution algorithms, slippage protection, and comprehensive wallet management capabilities.

## Features

- **Multi-Wallet Trading**: Execute trades across multiple replica wallets for enhanced liquidity and reduced market impact
- **Intelligent Distribution**: Advanced algorithms for optimal trade distribution across wallets
- **Cardano Integration**: Native support for Cardano blockchain and tokens
- **Real-time Token Metadata**: Automatic fetching and caching of token information
- **RESTful API**: Clean, well-documented API endpoints for all operations
- **Transaction Management**: Robust transaction handling with rollback capabilities

## Architecture

The application follows a modular architecture built on NestJS with the following key components:

- **Controllers**: Handle HTTP requests and responses (`/src/controllers/`)
  - `TransactionController`: Manages buy/sell operations
  - `WalletController`: Handles wallet management
- **Services**: Business logic implementation (`/src/services/`)
  - `CardanoTokenService`: Core token trading functionality
  - `WalletService`: Wallet management and operations
  - `DexhunterService`: DEX integration for token swaps
  - `BlockChainService`: Blockchain interaction layer
- **Entities**: Database models (`/src/model/entities/`)
  - User, Wallet, ReplicaWallet entities
- **Providers**: External service integrations
  - BlockFrost API integration
  - DexHunter SDK integration

## Prerequisites

- **Node.js** (v18 or higher)
- **Bun** runtime
- **PostgreSQL** database
- **Cardano** wallet setup
- **BlockFrost** API key
- **DexHunter** API access

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/TiagoJFil/TokenMassSwapper.git
cd TokenMassSwapper
```

2. **Install dependencies**
```bash
bun install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=tokenmassswapper

# Cardano Configuration
BLOCKFROST_API_KEY=your_blockfrost_api_key
BLOCKFROST_NETWORK=mainnet  # or testnet

# DexHunter Configuration
DEXHUNTER_API_KEY=your_dexhunter_api_key

# Application Configuration
PORT=3000
```

4. **Set up the database**
```bash
# Create PostgreSQL database and run the schema
psql -U your_username -d tokenmassswapper -f db.sql
```

## Development

```bash
# Start development server
bun run start:dev

# Start production server  
bun run start:prod

# Build the project
bun run build
```

## API Endpoints

### Transaction Operations

#### Buy Token with Multiple Wallets
```http
POST /transaction/user/{user_id}/buy/{policy_id}
```
**Body:**
```json
{
  "amount": 1000000,
  "slippage": 0.05,
  "selfSend": false,
  "distribution": "EQUAL" // or "WEIGHTED", "RANDOM"
}
```

#### Sell Token with Multiple Wallets
```http
POST /transaction/user/{user_id}/sell/{policy_id}
```
**Body:**
```json
{
  "percentage": 0.5,
  "slippage": 0.05,
  "selfSend": false,
  "distribution": "EQUAL"
}
```

### Wallet Management

#### Create User Wallet
```http
POST /wallet/user/{user_id}/create
```

#### Create Replica Wallets
```http
POST /wallet/user/{user_id}/replicas
```
**Body:**
```json
{
  "count": 5
}
```

#### Get Wallet Balance
```http
GET /wallet/{wallet_address}/balance
```

## Distribution Strategies

The platform supports several distribution strategies for multi-wallet operations:

- **EQUAL**: Distributes trades equally across all wallets
- **WEIGHTED**: Uses predefined weight tables for distribution  
- **RANDOM**: Randomly distributes trades with controlled variance

## Technology Stack

- **Framework**: NestJS
- **Runtime**: Bun
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Cardano
- **APIs**: BlockFrost, DexHunter
- **Language**: TypeScript

## Project Structure

```
src/
├── controllers/          # HTTP controllers
│   └── cardano/         # Cardano-specific controllers
├── services/            # Business logic services
│   ├── cardano/        # Cardano blockchain services
│   └── exceptions/     # Custom exception handling
├── model/              # Data layer
│   ├── entities/       # TypeORM entities
│   └── database/       # Database configuration
├── utils/              # Utility functions and constants
└── nextjs/             # Next.js integration utilities
```

## Security Considerations

- All wallet mnemonics are encrypted in the database
- API endpoints include input validation and sanitization
- Transaction operations use database transactions for atomicity
- Slippage protection prevents unfavorable trades
- Rate limiting should be implemented for production use

## License

This project is licensed under the Apache-2.0 license - see the [LICENSE](LICENSE) file for details.


## Disclaimer

This software is for educational and development purposes. Always test thoroughly on testnets before using with real funds. The developers are not responsible for any financial losses incurred through the use of this software.



# Ignore.. (info for future kaspa integration)
https://docs.kasplex.org/tools-and-reference/kasplex-indexer-api/general/get-indexer-status



kasplex  for handling krc20
kaspa api for handling kas transference

can use this as wallet: https://github.com/KaffinPX/Kaspian
or install a wallet and a node..



if needed run own kaspa api server
https://github.com/kaspa-ng/kaspa-rest-server



wasm bin path: https://kaspa.aspectron.org/nightly/downloads/
download, open and insert content from nodejs/kaspa folder on ./wasm directory



https://github.com/telegraf/telegraf