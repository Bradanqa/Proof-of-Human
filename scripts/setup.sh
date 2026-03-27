#!/bin/bash

set -e

echo "Setting up environment..."

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Checking Python installation..."
python3 --version || { echo "Python 3.10+ required"; exit 1; }

echo "Checking Node.js installation..."
node --version || { echo "Node.js 18+ required"; exit 1; }

echo "Checking Solana CLI..."
solana --version || { echo "Solana CLI required"; exit 1; }

echo "Checking Anchor..."
anchor --version || { echo "Anchor Framework required"; exit 1; }

echo "Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing contract dependencies..."
cd programs/human-registry
npm install
cd ../..

echo "Creating necessary directories..."
mkdir -p backend/models
mkdir -p backend/logs
mkdir -p frontend/.next

echo "Environment setup complete!"