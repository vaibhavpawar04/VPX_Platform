# VPX Crypto Trading POS Platform

A full-stack cryptocurrency trading and point-of-sale platform built with React, Node.js, MongoDB, and real blockchain integrations.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Space Grotesk
- **Backend:** Node.js, Express, MongoDB Atlas
- **Blockchain:** Ethereum Sepolia (Alchemy) + Solana Devnet (Helius)
- **DEX:** Uniswap V3 (Sepolia) + Orca Whirlpools (Devnet)
- **Payments:** Stripe Sandbox

## Features
- Real ETH/SOL deposit detection
- Multi-coin wallet with swap
- POS terminal with Stripe integration
- Real on-chain DEX liquidation
- Portfolio tracking with P&L
- Payment preferences (priority order)

## Setup

### Backend
cd backend
npm install
cp .env.example .env  # Add your API keys
node src/index.js

### Frontend
cd frontend
npm install
npm start
