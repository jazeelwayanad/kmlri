#!/usr/bin/env bash
# ==============================================================================
# KMLRI Library System - Fast Update & Build Script
# Pulls git changes, installs deps, runs migrations, builds & restarts services.
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/kmlri"
cd "${APP_DIR}"

echo ">>> [1/5] Pulling latest code from Git..."
if [ -d ".git" ]; then
  git pull origin main || true
fi

echo ">>> [2/5] Installing npm dependencies..."
npm ci --legacy-peer-deps || npm install

echo ">>> [3/5] Running Prisma schema generation & database migration..."
npm run prisma:generate
npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss

# Optionally seed if database is empty
# npm run prisma:seed

echo ">>> [4/5] Building NestJS Backend and Next.js Frontend..."
npm run build:api
npm run build:web

echo ">>> [5/5] Restarting Systemd services..."
sudo systemctl restart kmlri-api
sudo systemctl restart kmlri-web

echo ">>> Checking status:"
sudo systemctl status kmlri-api --no-pager
sudo systemctl status kmlri-web --no-pager

echo ">>> Deployment completed successfully! 🚀"
