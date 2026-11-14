#!/usr/bin/env bash
# sensorloop: refuses the agent's edits to files only a person changes, such as the thresholds of a check. Run from a
# PreToolUse hook on the file-editing tools, with the protected paths relative to the project:
#
#   protect.sh <path> [<path>...]
#
# It reads the tool call from stdin, and when its file_path is one of the paths it prints why to stderr and exits 2:
# Claude Code refuses the edit and shows the agent the reason. Bash only, no other tools needed.
set -u

input="$(cat)"
file="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed -E 's/.*"([^"]*)"$/\1/')"
[ -n "$file" ] || exit 0

project="${CLAUDE_PROJECT_DIR:-$(pwd)}"
for path in "$@"; do
  if [ "$file" = "$project/$path" ] || [ "$file" = "$path" ] || [ "$file" = "./$path" ]; then
    printf 'sensorloop: %s is changed only by a person (.sensorloop/LOOPS.md, "Ask a person first"). Fix the work, not the check; if the check is wrong, tell the person what to change and why.\n' "$path" >&2
    exit 2
  fi
done
exit 0
