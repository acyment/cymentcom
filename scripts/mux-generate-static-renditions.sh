#!/usr/bin/env bash
set -euo pipefail

# Create static MP4 renditions for a list of Mux playback IDs using the Static Renditions API.
# - Requires: curl, jq
# - Env: MUX_TOKEN_ID, MUX_TOKEN_SECRET
#
# Usage:
#   scripts/mux-generate-static-renditions.sh [--nowait] [--progress] [--check] [--probe] 1080p 720p 480p -- <playback_ids.txt|->
#   echo "PLAYBACKID1\nPLAYBACKID2" | scripts/mux-generate-static-renditions.sh --check --probe 1080p 720p 480p -- -
#
# Output: CSV to stdout -> playback_id,asset_id,public_playback_id,mp4_name,mp4_url,status

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required (brew install jq or apt-get install jq)" >&2
  exit 2
fi

if [[ -z "${MUX_TOKEN_ID:-}" || -z "${MUX_TOKEN_SECRET:-}" ]]; then
  echo "Set MUX_TOKEN_ID and MUX_TOKEN_SECRET env vars." >&2
  exit 2
fi

# Build curl auth args once (Basic auth)
AUTH=(-u "$MUX_TOKEN_ID:${MUX_TOKEN_SECRET:-}")

if [[ $# -lt 2 ]]; then
  cat >&2 <<USAGE
Usage: $0 <resolutions...> -- <playback_ids_file | ->
  resolutions: one or more of: highest audio-only 2160p 1440p 1080p 720p 540p 480p 360p 270p
USAGE
  exit 2
fi

# Options
NOWAIT=0
PROGRESS=0
CHECK_ONLY=0
DEBUG=0
PROBE=0

# Parse args until --
resolutions=()
while (( $# )); do
  case "$1" in
    --nowait) NOWAIT=1 ;;
    --progress) PROGRESS=1 ;;
    --check) CHECK_ONLY=1 ;;
    --debug) DEBUG=1 ;;
    --probe) PROBE=1 ;;
    --) shift; break ;;
    *) resolutions+=("$1") ;;
  esac
  shift
done

INPUT=${1:-}
if [[ -z "$INPUT" ]]; then
  echo "Missing playback IDs input (file path or - for stdin)" >&2
  exit 2
fi

# Build a unique, cleaned list of playback IDs in a portable way (bash 3 compatible)
TMP_IDS=$(mktemp 2>/dev/null || mktemp -t muxids)
{
  if [[ "$INPUT" = "-" ]]; then
    cat
  else
    cat "$INPUT"
  fi
} \
  | tr -d '\r' \
  | sed -E 's/#.*$//' \
  | grep -Eo '[A-Za-z0-9]{16,}' \
  | sort -u > "$TMP_IDS"

IDS=()
while IFS= read -r _id; do
  [[ -n "$_id" ]] && IDS+=("$_id")
done < "$TMP_IDS"
rm -f "$TMP_IDS"

if [[ ${#IDS[@]} -eq 0 ]]; then
  echo "No playback IDs found in input" >&2
  exit 2
fi

echo "playback_id,asset_id,public_playback_id,mp4_name,mp4_url,status"

API="https://api.mux.com/video/v1"

resolve_asset() {
  local pid=$1
  curl -sS "${AUTH[@]}" "$API/playback-ids/$pid" | jq -r '.data.object.id // empty'
}

get_asset() {
  local asset_id=$1
  curl -sS "${AUTH[@]}" "$API/assets/$asset_id"
}

# Return probe result for a URL: "ready" for 200/206, otherwise "not_ready"
probe_url() {
  local url=$1
  if [[ -z "$url" ]]; then
    echo "not_ready"; return 0
  fi
  local code
  code=$(curl -sIL -o /dev/null -w "%{http_code}" "$url" || echo "000")
  case "$code" in
    200|206) echo "ready" ;;
    *) echo "not_ready" ;;
  esac
}

ensure_public_pid() {
  local asset_id=$1
  local public_pid
  public_pid=$(get_asset "$asset_id" | jq -r '.data.playback_ids // [] | map(select(.policy=="public")) | .[0].id // empty')
  if [[ -n "$public_pid" ]]; then
    echo "$public_pid"
    return 0
  fi
  public_pid=$(curl -sS "${AUTH[@]}" -H 'content-type: application/json' -X POST \
    "$API/assets/$asset_id/playback-ids" \
    -d '{"policy":"public"}' | jq -r '.data.id // empty')
  echo "$public_pid"
}

create_static() {
  local asset_id=$1
  local resolution=$2
  # Note: endpoint path uses hyphen: static-renditions (not underscore)
  if (( DEBUG )); then
    echo "[debug] POST $API/assets/$asset_id/static-renditions {\"resolution\":\"$resolution\"}" >&2
  fi
  local resp
  resp=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" "${AUTH[@]}" -H 'content-type: application/json' -X POST \
    "$API/assets/$asset_id/static-renditions" \
    -d "{\"resolution\":\"$resolution\"}")
  local status body
  status=$(echo "$resp" | sed -n 's/^HTTP_STATUS://p')
  body=$(echo "$resp" | sed '/^HTTP_STATUS:/d')
  if (( DEBUG )); then
    echo "[debug] status=$status body=$body" >&2
  fi
  case "$status" in
    201|202) return 0 ;;
    409) # already exists / duplicate
      (( DEBUG )) && echo "[debug] rendition already exists for $resolution" >&2
      return 0 ;;
    *)
      echo "[warn] failed to create $resolution for asset $asset_id (HTTP $status): $body" >&2
      return 1 ;;
  esac
}

poll_ready() {
  local asset_id=$1
  local -a want=(${resolutions[@]})
  local tries=120
  local delay=5
  local tick=0
  while (( tries-- > 0 )); do
    local json
    json=$(get_asset "$asset_id")
    # Map of name->status for static renditions
    local ready_count total
    total=${#want[@]}
    ready_count=$(echo "$json" | jq -r \
      --argjson want "$(printf '%s\n' "${want[@]}" | jq -R . | jq -s .)" '
      def status_for($sr; $name):
        if ($sr|type)=="array" then
          ($sr | map(select(type=="object" and .name==$name)) | .[0].status // "missing")
        elif ($sr|type)=="object" and ($sr.files? // empty) != empty then
          ($sr.files | map(select(type=="object" and .name==$name)) | .[0].status // "missing")
        else
          "missing"
        end;

      (.data.static_renditions // null) as $sr |
      [ $want[] | (.+".mp4") as $nm | status_for($sr; $nm) ]
      | map(select(.=="ready")) | length')
    if [[ "$ready_count" =~ ^[0-9]+$ ]] && (( ready_count >= total )); then
      (( PROGRESS )) && echo " ready" >&2
      return 0
    fi
    if (( PROGRESS )); then
      (( tick++ ))
      if (( tick % 12 == 0 )); then
        echo -n " ${tick}s" >&2
      else
        echo -n "." >&2
      fi
    fi
    sleep "$delay"
  done
  (( PROGRESS )) && echo " timeout" >&2
  return 1
}

for pid in "${IDS[@]}"; do
  asset_id="$(resolve_asset "$pid")"
  if [[ -z "$asset_id" ]]; then
    echo "$pid,,, , ,resolve_failed"; continue
  fi

  if (( CHECK_ONLY )); then
    # Check existing statuses without creating anything
    asset_json=$(get_asset "$asset_id")
    public_pid=$(echo "$asset_json" | jq -r '.data.playback_ids // [] | map(select(.policy=="public")) | .[0].id // empty')
    for r in "${resolutions[@]}"; do
      name="$r.mp4"
      st=$(echo "$asset_json" | jq -r --arg name "$name" '
        (.data.static_renditions // null) as $sr |
        if ($sr|type)=="array" then
          ($sr | map(select(type=="object" and .name==$name)) | .[0].status // "missing")
        elif ($sr|type)=="object" and ($sr.files? // empty) != empty then
          ($sr.files | map(select(type=="object" and .name==$name)) | .[0].status // "missing")
        else
          "missing"
        end')
      [[ -z "$st" ]] && st="unknown"
      url=""
      [[ -n "$public_pid" ]] && url="https://stream.mux.com/${public_pid}/${name}"
      if (( PROBE )); then
        ps=$(probe_url "$url")
        if [[ "$ps" == "ready" ]]; then
          st="ready"
        fi
      fi
      echo "$pid,$asset_id,$public_pid,$name,$url,$st"
    done
    continue
  fi

  # Kick off static renditions for requested resolutions
  for r in "${resolutions[@]}"; do
    create_static "$asset_id" "$r" >/dev/null || true
  done

  public_pid=$(ensure_public_pid "$asset_id")

  status="preparing"
  if (( NOWAIT == 0 )); then
    (( PROGRESS )) && echo -n "Waiting for renditions ($pid / $asset_id)" >&2
    if poll_ready "$asset_id"; then
      status="ready"
    else
      status="timeout"
    fi
  fi

  # Emit CSV rows for each requested rendition
  for r in "${resolutions[@]}"; do
    name="$r.mp4"
    url="https://stream.mux.com/${public_pid}/${name}"
    if (( PROBE )); then
      ps=$(probe_url "$url")
      if [[ "$ps" == "ready" ]]; then
        echo "$pid,$asset_id,$public_pid,$name,$url,ready"
      else
        echo "$pid,$asset_id,$public_playback_id,$name,$url,$status"
      fi
    else
      echo "$pid,$asset_id,$public_pid,$name,$url,$status"
    fi
  done
done
