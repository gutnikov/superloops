---
title: Syntax-tree pattern rules
summary: Rules written as code patterns over the syntax tree, for conventions no stock linter knows.
sensors: [linter, security-scanner]
layer: project
vendors:
  - name: ast-grep
    url: https://ast-grep.github.io/
    note: several languages; rules in YAML
  - name: Semgrep
    url: https://docs.semgrep.dev/writing-rules/overview
    note: custom rules, several languages
  - name: ESLint
    url: https://eslint.org/docs/latest/rules/no-restricted-syntax
    note: "`no-restricted-syntax` with selectors over the syntax tree, or a rule of the project's own; JavaScript"
  - name: Comby
    url: https://comby.dev/
    note: patterns over brackets and strings, in any language
---

Some conventions belong to one project, and no stock linter knows them: every database call goes through the
project's helper, say, or no handler logs a request body. The project writes each one as a rule, a code pattern the
tool matches against the syntax tree, so the rule sees the structure of the code rather than its text. A rule can
also forbid an unsafe pattern, such as an SQL query built by joining strings; such rules make the tool a security
scanner as well as a linter.

## Finding it

Look for the rule files in the repository: an `sgconfig.yml` and its rule directories for ast-grep, a directory of
YAML rules for Semgrep. Then look in CI or the pre-commit config for the step that runs them. When the project has no
rules, adding the tool and its first rules is a decision for a person.

## Using it

- **Run them**: `ast-grep scan`, or `semgrep scan --config <rules>`; on changed files while working, on everything in
  CI.
- **Test every rule**: beside each rule, keep examples that must match and examples that must not, and run them as
  tests of the rule (`ast-grep test`, `semgrep --test`).
- **Say how to fix**: the rule's message names the fix, not only the problem.
