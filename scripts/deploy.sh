#!/bin/bash

set -e

echo "=========================================="
echo "  Proof-of-Human Deployment Script"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

source .env 2>/dev/null || true

echo ""
echo "Step 1: Setting up environment..."
bash "$SCRIPT_DIR/setup.sh"

echo ""
echo "Step 2: Deploying smart contracts..."
bash "$SCRIPT_DIR/deploy-contract.sh"

echo ""
echo "Step 3: Deploying backend..."
bash "$SCRIPT_DIR/deploy-backend.sh"

echo ""
echo "Step 4: Deploying frontend..."
bash "$SCRIPT_DIR/deploy-frontend.sh"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Docs:     http://localhost:8000/docs"
echo ""