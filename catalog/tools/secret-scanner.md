---
title: Secret scanner
summary: Finds credentials in files, staged changes and the git history.
sensors: [security-scanner]
layer: project
vendors:
  - name: Gitleaks
    url: https://github.com/gitleaks/gitleaks
  - name: TruffleHog
    url: https://github.com/trufflesecurity/trufflehog
    note: checks whether a key it finds is live
  - name: detect-secrets
    url: https://github.com/Yelp/detect-secrets
    note: with a baseline of known findings
  - name: ggshield
    url: https://github.com/GitGuardian/ggshield
    note: GitGuardian's command line
  - name: GitHub secret scanning
    url: https://docs.github.com/en/code-security/how-tos/secure-your-secrets
    note: on the code host, with push protection
---

A secret scanner looks for keys, tokens and passwords, and works the same whatever the stack. Look for the one the
project already runs before adding one.

## Finding it

- **A pre-commit hook**: `.pre-commit-config.yaml`, or the project's own hook manager.
- **CI**: a job that scans the pull request's commits or the whole history.
- **Its config and allowlist**: `.gitleaks.toml` and `.gitleaksignore` for Gitleaks, `.secrets.baseline` for
  detect-secrets.
- **The code host's own secret scanning**, when it is turned on.

When none of these has a scanner, ask a person before adding one.

## Using it

- **Before a commit, scan only what is staged** (`--staged` in Gitleaks).
- **In CI, scan the full history once**, then only the new commits of each pull request.
- **Report a secret's place, never its value** (`--redact` in Gitleaks), so the report does not leak it again.
- **Tell a person about a leaked secret**: they revoke it and issue a new one. Deleting it is not enough, since it
  stays in the history and in every clone.
- **Give every allowlist entry a reason**, such as a fake key in a test fixture.
