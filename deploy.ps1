# ============================================================
# World Cup 2026 Companion — one-shot setup & deploy (Windows)
# Run this from INSIDE the unzipped world-cup-2026-companion folder:
#   powershell -ExecutionPolicy Bypass -File deploy.ps1
# Requires: node/npm, git, gh (GitHub CLI, logged in), vercel CLI
# ============================================================
$ErrorActionPreference = "Stop"

Write-Host "==> 1/6 Installing dependencies"
npm install

Write-Host "==> 2/6 Verifying production build"
npm run build

Write-Host "==> 3/6 Checking GitHub CLI auth"
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub CLI is not logged in. Running 'gh auth login'..."
  gh auth login
}

Write-Host "==> 4/6 Creating GitHub repository and pushing (with v1.0.0 tag)"
gh repo create world-cup-2026-companion --public --source=. --push --description "A modern World Cup 2026 companion web app with official-source fixtures, standings, live scores, reminders, where-to-watch options, stats, travel guides, watch parties, and personalized team tracking."
git push origin v1.0.0

gh repo edit --add-topic nextjs --add-topic typescript --add-topic tailwindcss --add-topic world-cup --add-topic football --add-topic world-cup-2026 --add-topic sports-app --add-topic pwa --add-topic vercel --add-topic official-data

Write-Host "==> 5/6 Creating GitHub release v1.0.0"
gh release create v1.0.0 --title "World Cup 2026 Companion v1.0.0" --notes-file RELEASE_NOTES_v1.0.0.md

Write-Host "==> 6/6 Deploying to Vercel (production)"
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  npm i -g vercel
}
vercel --prod

Write-Host ""
Write-Host "============================================================"
Write-Host "Done! Final manual touches:"
Write-Host "  1. Add env vars in Vercel -> Project -> Settings -> Environment Variables"
Write-Host "     (at minimum ADMIN_PASSWORD and CRON_SECRET; OFFICIAL_*_URL for live data)"
Write-Host "  2. Paste the Vercel live URL into README.md and the repo About section:"
Write-Host "     gh repo edit --homepage https://YOUR-DEPLOYMENT.vercel.app"
Write-Host "  3. Note: sub-daily crons in vercel.json need Vercel Pro; on Hobby,"
Write-Host "     change schedules to daily (e.g. '0 6 * * *')."
Write-Host "============================================================"
