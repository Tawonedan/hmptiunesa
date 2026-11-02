#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RUN_BACKEND=false
RUN_SUPABASE=false

for arg in "$@"; do
  case $arg in
    --backend)
      RUN_BACKEND=true
      shift
      ;;
    --supabase)
      RUN_SUPABASE=true
      shift
      ;;
  esac
done

PIDS=()

cleanup() {
  echo ""
  echo "Shutting down background services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

if [ "$RUN_SUPABASE" = true ]; then
  echo "Starting Supabase local stack..."
  supabase start &
  PIDS+=($!)
fi

if [ "$RUN_BACKEND" = true ]; then
  echo "Starting Backend API..."
  (cd "$ROOT_DIR/backend" && npm run dev) &
  PIDS+=($!)
fi

echo "Starting Frontend (Vite)..."
(cd "$ROOT_DIR/frontend" && npm run dev)
