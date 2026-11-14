#!/usr/bin/env bash
# sensorloop: runs one of the project's checks after a Bash call whose command matches a pattern, such as a deploy.
# Run from a PostToolUse hook on Bash:
#
#   after.sh <pattern> <label> <command>     <pattern> is an extended regular expression
#
# When the call's command matches, it hands the call to check.sh, which runs <command> and, on a failure, shows the
# agent the end of its output (exit 2). Any other Bash call passes untouched. Bash only, no other tools needed.
set -u

pattern="${1:?usage: after.sh <pattern> <label> <command>}"
label="${2:?usage: after.sh <pattern> <label> <command>}"
command="${3:?usage: after.sh <pattern> <label> <command>}"

input="$(cat)"
called="$(printf '%s' "$input" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1)"
printf '%s' "$called" | grep -Eq "$pattern" || exit 0

printf '%s' "$input" | "$(dirname "$0")/check.sh" "$label" "$command"
