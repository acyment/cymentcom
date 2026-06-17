#!/usr/bin/env bash
set -Eeuo pipefail

# Local nightly PostgreSQL backup wrapper
# - Runs the container-maintained 'backup' script
# - Verifies gzip integrity of newest file
# - Prunes backups older than 7 days
# - Logs to ~/postgres-backup.log

HOME_DIR="${HOME_DIR:-$HOME}"
LOGFILE="${LOGFILE:-$HOME_DIR/postgres-backup.log}"
COMPOSE_FILE="${COMPOSE_FILE:-$HOME_DIR/src/production.yml}"
DOCKER="${DOCKER:-$(command -v docker)}"

{
  echo "["$(date -Is)"] Start backup"
  "$DOCKER" compose -f "$COMPOSE_FILE" exec -T postgres backup

  # Verify gzip integrity of most recent dump
  "$DOCKER" compose -f "$COMPOSE_FILE" exec -T postgres bash -lc 'set -e; f=$(ls -1t /backups/backup_*.sql.gz | head -1); test -n "$f"; gzip -t "$f"'

  # Prune files older than 7 days
  "$DOCKER" compose -f "$COMPOSE_FILE" exec -T postgres bash -lc 'find /backups -type f -mtime +7 -name "backup_*.sql.gz" -print -delete'

  # Show backup dir summary
  "$DOCKER" compose -f "$COMPOSE_FILE" exec -T postgres bash -lc 'ls -lht /backups | head -50'
  echo "["$(date -Is)"] Done"
} >>"$LOGFILE" 2>&1
