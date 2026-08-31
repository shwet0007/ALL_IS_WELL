#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$ROOT_DIR/.env" ]]; then
  echo "Missing .env file. Copy .env.example to .env and fill DB_PASSWORD and JWT_SECRET."
  exit 1
fi

if lsof -nP -iTCP:3001 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 3001 is already in use. Stop the existing backend before running this script."
  exit 1
fi

if lsof -nP -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 8080 is already in use. Stop the existing frontend before running this script."
  exit 1
fi

set -a
source "$ROOT_DIR/.env"
set +a

cd "$ROOT_DIR/backend-spring"
mvn spring-boot:run &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd "$ROOT_DIR/frontend"
if [[ ! -d node_modules ]]; then
  npm install
fi

npm run dev
