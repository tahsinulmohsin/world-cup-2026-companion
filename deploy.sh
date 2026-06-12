#!/usr/bin/env bash
# ============================================================
# World Cup 2026 Companion — one-shot setup & deploy
# Run this from INSIDE the unzipped world-cup-2026-companion folder:
#   bash deploy.sh
# Requires: node/npm, git, gh (GitHub CLI, logged in), vercel CLI
# ============================================================
set -e

echo "==> 1/6 Installing dependencies"
npm install

echo "==> 2/6 Verifying production build"
npm run build

echo "==> 3/6 Checking GitHub CLI auth"
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not logged in. Running 'gh auth login'..."
  gh auth login
fi

echo "==> 4/6 Creating GitHub repository and pushing (with v1.0.0 tag)"
gh repo create world-cup-2026-companion --public --source=. --push \
  --description "A modern World Cup 2026 companion web app with official-source fixtures, standings, live scores, reminders, where-to-watch options, stats, travel guides, watch parties, and personalized team tracking."
git push origin v1.0.0

gh repo edit --add-topic nextjs --add-topic typescript --add-topic tailwindcss \
  --add-topic world-cup --add-topic football --add-topic world-cup-2026 \
  --add-topic sports-app --add-topic pwa --add-topic vercel --add-topic official-data

echo "==> 5/6 Creating GitHub release v1.0.0"
gh release create v1.0.0 --title "World Cup 2026 Companion v1.0.0" \
  --notes-file RELEASE_NOTES_v1.0.0.md

echo "==> 6/6 Deploying to Vercel (production)"
if ! command -v vercel >/dev/null 2>&1; then
  npm i -g vercel
fi
vercel --prod

echo ""
echo "============================================================"
echo "Done! Final manual touches:"
echo "  1. Add env vars in Vercel → Project → Settings → Environment Variables"
echo "     (at minimum ADMIN_PASSWORD and CRON_SECRET; OFFICIAL_*_URL for live data)"
echo "  2. Paste the Vercel live URL into README.md and the repo About section:"
echo "     gh repo edit --homepage https://YOUR-DEPLOYMENT.vercel.app"
echo "  3. Note: sub-daily crons in vercel.json need Vercel Pro; on Hobby,"
echo "     change schedules to daily (e.g. \"0 6 * * *\")."
echo "============================================================"
