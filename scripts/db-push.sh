#!/usr/bin/env bash
# Apply a SQL migration directly to Supabase via Management API
# Usage: ./scripts/db-push.sh <migration_file.sql>
#        ./scripts/db-push.sh "ALTER TABLE ..."   (inline SQL)
set -euo pipefail

PAT="${SUPABASE_ACCESS_TOKEN:-}"
PROJECT="${VITE_SUPABASE_PROJECT_ID:-rpuqbtcxdvaamiitmchd}"

if [[ -z "$PAT" ]]; then
  # Try loading from .env
  if [[ -f ".env" ]]; then
    PAT=$(grep SUPABASE_ACCESS_TOKEN .env | cut -d'"' -f2)
  fi
fi

if [[ -z "$PAT" ]]; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN not set. Add it to .env" >&2
  exit 1
fi

if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 <file.sql | sql_string>" >&2
  exit 1
fi

# Read SQL from file or treat arg as inline SQL
if [[ -f "$1" ]]; then
  SQL=$(cat "$1")
  echo "Applying migration: $1"
else
  SQL="$1"
  echo "Applying inline SQL..."
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT/database/query" \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✓ Done"
else
  echo "✗ Error (HTTP $HTTP_CODE): $BODY" >&2
  exit 1
fi
