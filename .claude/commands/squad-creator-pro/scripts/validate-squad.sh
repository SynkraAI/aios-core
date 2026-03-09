#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_VALIDATOR="${SCRIPT_DIR}/../../squad-creator/scripts/validate-squad.sh"

if [[ ! -f "${BASE_VALIDATOR}" ]]; then
  echo "ERROR: Base validator not found at ${BASE_VALIDATOR}" >&2
  exit 1
fi

exec "${BASE_VALIDATOR}" "$@"
