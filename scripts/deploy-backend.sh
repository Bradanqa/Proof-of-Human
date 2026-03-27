#!/bin/bash

set -e

echo "Deploying backend service..."

cd backend

echo "Activating virtual environment..."
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "Running database migrations..."
python -m sqlalchemy || true

echo "Starting backend server..."
if [ "$DEPLOYMENT_MODE" = "production" ]; then
    echo "Production mode with gunicorn..."
    pip install gunicorn
    gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
else
    echo "Development mode with uvicorn..."
    python main.py
fi

cd ..