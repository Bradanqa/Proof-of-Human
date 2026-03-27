#!/bin/bash

set -e

echo "Deploying frontend application..."

cd frontend

echo "Building Next.js application..."
if [ "$DEPLOYMENT_MODE" = "production" ]; then
    npm run build
    npm run start
else
    npm run dev
fi

cd ..