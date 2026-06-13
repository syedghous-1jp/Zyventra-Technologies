# Zyventra – External Exposure Scanner (v1)

Production-ready MVP for non-technical founders to identify risky open ports and external exposure.

## What this version includes
- Context-aware risk scoring
- Baseline comparison (new vs old exposure)
- Executive-ready reporting
- Safe-by-default scanning

## How to run
pnpm install
docker-compose up -d
cd apps/scanner-api && pnpm dev
cd apps/web && pnpm dev

Open http://localhost:3000
