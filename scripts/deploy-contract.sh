#!/bin/bash

set -e

echo "Deploying Solana smart contracts..."

cd programs/human-registry

echo "Building contracts..."
anchor build

echo "Reading program ID..."
PROGRAM_ID=$(grep -m 1 "declare_id!" src/lib.rs | sed 's/.*"\(.*\)".*/\1/')
echo "Program ID: $PROGRAM_ID"

echo "Checking Solana configuration..."
solana config get

echo "Requesting airdrop (devnet only)..."
solana airdrop 2 || true

echo "Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo "Updating program ID in environment..."
cd ../..

if [ -f .env ]; then
    sed -i.bak "s/PROGRAM_ID=.*/PROGRAM_ID=$PROGRAM_ID/" .env
    sed -i.bak "s/NEXT_PUBLIC_PROGRAM_ID=.*/NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID/" .env
    rm -f .env.bak
fi

echo "Contract deployment complete!"
echo "Program ID: $PROGRAM_ID"