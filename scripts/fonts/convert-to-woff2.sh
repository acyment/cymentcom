#!/usr/bin/env bash
set -euo pipefail

# Converts the Rubik variable TTF to WOFF2 in-place under frontend/public/fonts.
# Requires the `woff2_compress` binary (from Google WOFF2) installed in the container.

HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
FONT_DIR="$ROOT/frontend/public/fonts"
TTF="$FONT_DIR/Rubik-VariableFont_wght.ttf"
OUT="$FONT_DIR/Rubik-VariableFont_wght.woff2"

if [[ ! -f "$TTF" ]]; then
  echo "ERROR: $TTF not found" >&2
  exit 1
fi

if ! command -v woff2_compress >/dev/null 2>&1; then
  echo "ERROR: woff2_compress not found. Install the woff2 package." >&2
  exit 1
fi

echo "Converting $TTF → $OUT ..."
woff2_compress "$TTF"

if [[ -f "$OUT" ]]; then
  echo "OK: $OUT created"
else
  echo "ERROR: conversion did not produce $OUT" >&2
  exit 1
fi
