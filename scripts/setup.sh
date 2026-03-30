#!/bin/bash
set -e

# One-command setup for SaaS Launchpad
echo "=== SaaS Launchpad Setup ==="
echo ""

# Copy env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from scripts/env.example..."
  cp scripts/env.example .env
fi

echo "Starting PostgreSQL..."
docker compose up -d db

echo "Waiting for database..."
until docker compose exec db pg_isready -U saas -d saas_launchpad > /dev/null 2>&1; do
  sleep 1
done
echo "Database is ready."

echo "Installing dependencies..."
npm install

echo "Running migrations..."
npx prisma migrate dev --name init

echo "Seeding demo data..."
npx prisma db seed

echo ""
echo "==============================="
echo "  Setup complete!"
echo "  Run 'npm run dev' to start."
echo "  Login: demo@example.com / password123"
echo "==============================="
