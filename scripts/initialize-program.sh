#!/bin/bash

set -e

echo "Initializing Proof-of-Human Program..."

cd backend
source venv/bin/activate

ADMIN_ADDRESS=$(solana address)

echo "Admin Address: $ADMIN_ADDRESS"

python -c "
from services.solana import SolanaService
service = SolanaService()
tx = service.initialize_program('$ADMIN_ADDRESS')
print(f'Initialization Transaction: {tx}')
"

cd ..

echo "Program initialization complete!"