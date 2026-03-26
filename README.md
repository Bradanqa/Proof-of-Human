# Proof-of-Human

**AI-Powered Sybil Resistance Protocol for Solana**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-9945FF.svg?style=flat&logo=solana&logoColor=white)](https://solana.com)
[![Python](https://img.shields.io/badge/Python-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)

Decentralized human verification system leveraging behavioral biometrics and machine learning to prevent Sybil attacks on Solana.

## Overview

Web3 ecosystems face significant threats from automated bots and Sybil attackers manipulating airdrops, governance votes, and NFT mints. Proof-of-Human provides a privacy-preserving verification layer that analyzes user interaction patterns to distinguish humans from scripts without requiring invasive KYC.

## Key Features

- **Behavioral Biometrics**: Analyzes mouse movements, click timing, and input dynamics.
- **AI Scoring Engine**: Machine learning models classify interaction quality in real-time.
- **Soulbound Identity**: Issues non-transferable NFTs upon successful verification.
- **Solana Native**: Built for high throughput and low transaction costs.
- **Open Source**: Fully transparent codebase for community audit and contribution.

## Tech Stack

- **Smart Contracts**: Rust, Anchor Framework, Solana Program Library
- **Backend**: Python, FastAPI, Scikit-learn, Redis
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Solana Wallet Adapter
- **Infrastructure**: PostgreSQL, Helius RPC

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Solana Tool Suite 1.17+
- Anchor Framework 0.29+
- PostgreSQL 14+
- Redis 7+

## Installation

### 1. Clone Repository

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your specific RPC URLs, database credentials, and secret keys.

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 4. Smart Contract Deployment

```bash
cd programs/human-registry
anchor build
anchor deploy
```

Update `PROGRAM_ID` in `.env` with the deployed program address.

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the application at `http://localhost:3000`.

## Usage

### Verification Flow

1. Connect Solana wallet via the frontend interface.
2. Complete behavioral challenges (clicks, input, navigation).
3. Backend analyzes telemetry and generates a human score.
4. If score exceeds threshold, backend signs verification transaction.
5. Smart contract mints Soulbound NFT to user wallet.

### API Endpoints

- `POST /api/verify`: Submit behavioral telemetry for scoring.
- `GET /api/status/:wallet`: Check verification status of a wallet.
- `POST /api/challenge`: Generate new interaction challenge.

## Project Structure

```
proof-of-human/
├── programs/          # Anchor smart contracts
├── backend/           # Python API and AI models
├── frontend/          # Next.js client application
├── scripts/           # Deployment and utility scripts
├── docs/              # Technical documentation
├── tests/             # Unit and integration tests
├── LICENSE            # MIT License
└── README.md          # Project documentation
```

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the project.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add AmazingFeature'`).
4. Push to branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure code passes all tests and adheres to the existing style guidelines.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

- **Twitter**: [@Bradanqa]

## Disclaimer

This software is experimental and provided "as is" without warranty of any kind. Users assume all risks associated with its use. Smart contracts should be audited before deployment to mainnet. Do not use with significant funds until thoroughly tested.
```