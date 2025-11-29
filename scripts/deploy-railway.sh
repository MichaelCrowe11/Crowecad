#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=${1:-.env.railway}

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI not found. Install with: npm i -g @railway/cli" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file '$ENV_FILE' not found. Provide a file similar to .env.railway.example." >&2
  exit 1
fi

set -o allexport
source "$ENV_FILE"
set +o allexport

required_vars=(DATABASE_URL APS_CLIENT_ID APS_CLIENT_SECRET SESSION_SECRET)
missing=()
for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    missing+=("$var")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required env vars: ${missing[*]}" >&2
  exit 1
fi

vars=(
  "NODE_ENV=${NODE_ENV:-production}"
  "PORT=${PORT:-8080}"
  "DATABASE_URL=$DATABASE_URL"
  "APS_CLIENT_ID=$APS_CLIENT_ID"
  "APS_CLIENT_SECRET=$APS_CLIENT_SECRET"
  "SESSION_SECRET=$SESSION_SECRET"
)

[[ -n "${VITE_API_URL:-}" ]] && vars+=("VITE_API_URL=$VITE_API_URL")
[[ -n "${OPENAI_API_KEY:-}" ]] && vars+=("OPENAI_API_KEY=$OPENAI_API_KEY")
[[ -n "${ANTHROPIC_API_KEY:-}" ]] && vars+=("ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY")

echo "Linking project (run 'railway init' beforehand if this is a new project)..."
railway link

printf "\nPushing environment variables...\n"
railway variables set "${vars[@]}"

printf "\nDeploying with Nixpacks build (railway.json)...\n"
railway up
