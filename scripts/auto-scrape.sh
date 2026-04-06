#!/bin/bash
cd /Users/winston/.openclaw/workspace/zaxscape
echo "$(date) — Starting weekly scrape..."
npx tsx scripts/scrape-real-estate.ts 2>&1
npx tsx scripts/scrape-businesses.ts 2>&1
if git diff --quiet data/; then
  echo "$(date) — No new data"
else
  git add data/
  git commit -m "auto: weekly listing scrape $(date +%Y-%m-%d)"
  git push origin main
fi
echo "$(date) — Done"
