#!/usr/bin/env bash
set -euo pipefail

# Collect playback IDs from one or more training API endpoints and output unique IDs.
# - Requires: curl, jq
#
# Usage:
#   scripts/mux-collect-training-ids.sh [--out pids-training.txt] [URL ...]
#
# If no URL is provided, tries common local endpoints:
#   - http://localhost:3000/api/tipos-de-curso
#   - http://localhost:8000/api/tipos-de-curso

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required (brew install jq or apt-get install jq)" >&2
  exit 2
fi

OUT=""
URLS=()
while (( $# )); do
  case "$1" in
    --out)
      OUT=${2:-}
      shift 2
      ;;
    *)
      URLS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#URLS[@]} -eq 0 ]]; then
  URLS=(
    "http://localhost:3000/api/tipos-de-curso"
    "http://localhost:8000/api/tipos-de-curso"
  )
fi

TMP=$(mktemp 2>/dev/null || mktemp -t muxpids)
trap 'rm -f "$TMP"' EXIT

for u in "${URLS[@]}"; do
  resp=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" "$u" || true)
  code=$(echo "$resp" | sed -n 's/^HTTP_STATUS://p')
  body=$(echo "$resp" | sed '/^HTTP_STATUS:/d')
  if [[ "$code" != "200" ]]; then
    echo "[warn] $u -> HTTP $code" >&2
    continue
  fi
  echo "$body" | jq -r '.[].video // empty' | grep -Eo '[A-Za-z0-9]{16,}' >> "$TMP" || true
done

if [[ ! -s "$TMP" ]]; then
  echo "[info] No playback IDs found from endpoints" >&2
  exit 0
fi

sort -u "$TMP" > "$TMP.sorted"
if [[ -n "$OUT" ]]; then
  cp "$TMP.sorted" "$OUT"
  echo "[ok] Wrote $(wc -l < "$OUT") IDs to $OUT" >&2
else
  cat "$TMP.sorted"
fi
