# One-command setup for SaaS Launchpad
$ErrorActionPreference = "Stop"

Write-Host "=== SaaS Launchpad Setup ===" -ForegroundColor Cyan
Write-Host ""

# Copy env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env from scripts/env.example..." -ForegroundColor Cyan
    Copy-Item scripts/env.example .env
}

Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
docker compose up -d db

Write-Host "Waiting for database..." -ForegroundColor Cyan
do {
    Start-Sleep -Seconds 1
} while (-not (docker compose exec db pg_isready -U saas -d saas_launchpad 2>$null))
Write-Host "Database is ready." -ForegroundColor Green

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Running migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init

Write-Host "Seeding demo data..." -ForegroundColor Cyan
npx prisma db seed

Write-Host ""
Write-Host "===============================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "  Run 'npm run dev' to start." -ForegroundColor Green
Write-Host "  Login: demo@example.com / password123" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Green
