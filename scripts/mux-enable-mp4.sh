#!/usr/bin/env bash
set -euo pipefail

# Enables MP4 static renditions on a list of Mux playback IDs.
# - Requires: curl, jq
# - Env: MUX_TOKEN_ID, MUX_TOKEN_SECRET
#
# Usage:
#   scripts/mux-enable-mp4.sh playback_ids.txt
#   # or echo IDs | scripts/mux-enable-mp4.sh -

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required (brew install jq or apt-get install jq)" >&2
  exit 2
fi

if [[ -z "${MUX_TOKEN_ID:-}" || -z "${MUX_TOKEN_SECRET:-}" ]]; then
  echo "Set MUX_TOKEN_ID and MUX_TOKEN_SECRET env vars." >&2
  exit 2
fi

INPUT=${1:-}
if [[ -z "$INPUT" ]]; then
  cat >&2 <<USAGE
Usage: $0 <playback_ids_file | ->
USAGE
  exit 2
fi

readarray -t IDS < <( ( [[ "$INPUT" = "-" ]] && cat || cat "$INPUT" ) \
  | tr -d '\r' \
  | sed -E 's/#.*$//' \
  | grep -Eo '[A-Za-z0-9]{16,}' \
  | sort -u )

if [[ ${#IDS[@]} -eq 0 ]]; then
  echo "No playback IDs found in input" >&2
  exit 2
fi

echo "Will process ${#IDS[@]} playback IDs" >&2

api() {
  local method=$1; shift
  local url=$1; shift
  curl -sS -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" -X "$method" \
    -H 'content-type: application/json' "$url" "$@"
}

ensure_public_playback_id() {
  local asset_id=$1
  # Check existing playback IDs
  local resp
  resp=$(api GET "https://api.mux.com/video/v1/assets/$asset_id")
  local has_public
  has_public=$(echo "$resp" | jq -r '.data.playback_ids // [] | map(.policy) | any(. == "public")')
  if [[ "$has_public" != "true" ]]; then
    echo "  + Creating public playback ID"
    api POST "https://api.mux.com/video/v1/assets/$asset_id/playback-ids" \
      -d '{"policy":"public"}' >/dev/null
  fi
}

enable_mp4_support() {
  local asset_id=$1
  echo "  + Enabling mp4_support=capped-1080p"
  api PUT "https://api.mux.com/video/v1/assets/$asset_id/mp4-support" \
    -d '{"mp4_support":"capped-1080p"}' >/dev/null
}

poll_ready() {
  local asset_id=$1
  local tries=60
  local delay=5
  while (( tries-- > 0 )); do
    local s
    s=$(api GET "https://api.mux.com/video/v1/assets/$asset_id" | \
      jq -r '[.data.static_renditions.status, .data.mp4_support] | @tsv')
    local static_status mp4_state
    static_status=$(echo "$s" | awk '{print $1}')
    mp4_state=$(echo "$s" | awk '{print $2}')
    echo "    status: static_renditions=${static_status:-n/a} mp4_support=${mp4_state:-n/a}"
    # Consider ready when either static_renditions is ready OR mp4_support reflects our setting
    if [[ "$static_status" == "ready" ]] || [[ "$mp4_state" == "capped-1080p" || "$mp4_state" == "standard" ]]; then
      return 0
    fi
    sleep "$delay"
  done
  return 1
}

for pid in "${IDS[@]}"; do
  echo "== Playback ID: $pid =="
  # Lookup asset id from playback id
  asset_id=$(api GET "https://api.mux.com/video/v1/playback-ids/$pid" | jq -r '.data.id // empty')
  if [[ -z "$asset_id" ]]; then
    echo "  ! Could not resolve asset for playback id $pid" >&2
    continue
  fi
  echo "  asset: $asset_id"
  enable_mp4_support "$asset_id"
  ensure_public_playback_id "$asset_id"
  if poll_ready "$asset_id"; then
    echo "  ✔ MP4 ready"
  else
    echo "  ! Timed out waiting for MP4 readiness" >&2
  fi
done

echo "Done. Verify with: curl -I https://stream.mux.com/<public_playback_id>/capped-1080p.mp4"
