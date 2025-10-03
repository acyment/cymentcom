#!/usr/bin/env bash
set -euo pipefail

# Show only ready MP4 URLs for the given playback IDs file and resolutions.
# Uses scripts/mux-generate-static-renditions.sh under the hood.
#
# Usage:
#   scripts/mux-ready-urls.sh <pids_file> [resolutions...]
#   # defaults to: 720p 480p

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <pids_file> [resolutions...]" >&2
  exit 2
fi

PIDS_FILE=$1; shift || true
if [[ ! -f "$PIDS_FILE" ]]; then
  echo "File not found: $PIDS_FILE" >&2
  exit 2
fi

if [[ $# -eq 0 ]]; then
  set -- 720p 480p
fi

DIR=$(cd "$(dirname "$0")" && pwd)
"$DIR/mux-generate-static-renditions.sh" --check --probe "$@" -- "$PIDS_FILE" \
  | awk -F, 'NR>1 && $6=="ready" {printf("%s %s %s\n", $1, $4, $5)}'
