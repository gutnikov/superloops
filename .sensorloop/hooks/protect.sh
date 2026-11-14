#!/usr/bin/env bash
# sensorloop: refuses the agent's edits to files only a person changes, such as the thresholds of a check. Run from a
# PreToolUse hook on the file-editing tools, with the protected paths relative to the project:
#
#   protect.sh <path> [<path>...]
#
# It reads the tool call from stdin and compares real paths, whatever the spelling (relative or absolute, `./`, `//`,
# a link, another letter case on a disk that ignores case). When the call edits a protected file, or cannot be read, it
# prints why to stderr and exits 2: Claude Code refuses the edit and shows the agent the reason. Needs node, which the
# project already runs. It guards the editing tools only: a shell command that writes the file is held by LOOPS.md's
# rules and by the pull request's review, not by this hook.
set -u

project="${CLAUDE_PROJECT_DIR:-$(pwd)}"
exec node -e '
const fs = require("fs");
const path = require("path");
const [project, ...guarded] = process.argv.slice(1);

let call;
try {
  call = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  console.error("sensorloop: protect.sh could not read the tool call, so it refuses the edit; try it again.");
  process.exit(2);
}
const input = (call && call.tool_input) || {};
const target = input.file_path || input.notebook_path;
if (typeof target !== "string" || !target) process.exit(0);

// The real path: resolved against the project, through links, folded to one case.
const real = (p) => {
  const abs = path.resolve(project, p);
  let full = abs;
  try {
    full = fs.realpathSync(abs);
  } catch {
    try {
      full = path.join(fs.realpathSync(path.dirname(abs)), path.basename(abs));
    } catch {}
  }
  return full.toLowerCase();
};

const hit = guarded.find((p) => real(p) === real(target));
if (hit) {
  console.error(
    `sensorloop: ${hit} is changed only by a person (.sensorloop/LOOPS.md, "Ask a person first"). ` +
      "Fix the work, not the check; if the check is wrong, tell the person what to change and why.",
  );
  process.exit(2);
}
' "$project" "$@"
