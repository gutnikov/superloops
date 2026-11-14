---
title: Static security scanner
summary: Reads the source for code patterns known to be unsafe, and reports each with its rule and place.
sensors: [security-scanner]
layer: project
vendors:
  - name: Semgrep
    url: https://semgrep.dev/
    note: several languages
  - name: CodeQL
    url: https://codeql.github.com/
    note: several languages; GitHub's code scanning
  - name: Bandit
    url: https://bandit.readthedocs.io/
    note: Python
  - name: gosec
    url: https://github.com/securego/gosec
    note: Go
  - name: Brakeman
    url: https://brakemanscanner.org/
    note: Ruby on Rails
  - name: Find Security Bugs
    url: https://find-sec-bugs.github.io/
    note: Java, with SpotBugs
---

A static security scanner reads the source without running it and matches it against rules for unsafe patterns:
injection, unsafe deserialisation, weak cryptography. Which scanner and which rules fit depends on the languages, so
look for the ones the project already uses rather than choosing new ones.

## Finding it

1. **CI**: a security job, often one that uploads its findings to the code host.
2. **Rule and config files**: a `.semgrep.yml` or a folder of custom rules, a `.semgrepignore`, a CodeQL config.
3. **The dependency manifest**: a scanner for one language among the development dependencies.

When these disagree, CI wins. When none of them shows a scanner, ask a person before adding one.

## Using it

- **Run it on the changed files** with the rules CI uses: for example `semgrep scan --config <rules> <paths>`.
- **Write SARIF**, the common format for scan findings (`--sarif` in Semgrep, `--format=sarif-latest` in CodeQL), so
  the code host shows findings on the diff.
- **Fail only on new findings**: compare with the main branch (`--baseline-commit` in Semgrep).
- **Give every suppression a reason**, in the comment that makes it (`nosemgrep`) or on the dismissed alert.
