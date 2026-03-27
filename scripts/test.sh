#!/bin/bash

set -e

echo "=========================================="
echo "  Running Test Suite"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo ""
echo "Step 1: Backend tests..."
cd backend
source venv/bin/activate 2>/dev/null || true
pytest tests/ -v
cd ..

echo ""
echo "Step 2: Smart contract tests..."
cd programs/human-registry
npm test
cd ../..

echo ""
echo "=========================================="
echo "  All Tests Complete!"
echo "=========================================="