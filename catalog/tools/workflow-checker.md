---
title: CI workflow checker
summary: "Checks the CI workflows themselves: third-party steps not pinned to a commit, permissions wider than needed, untrusted input in commands."
sensors: [structure-check, security-scanner]
layer: project
vendors:
  - name: actionlint
    url: https://github.com/rhysd/actionlint
    note: GitHub Actions
  - name: zizmor
    url: https://docs.zizmor.sh/
    note: GitHub Actions; security findings
  - name: pinact
    url: https://github.com/suzuki-shunsuke/pinact
    note: GitHub Actions; pins each action to a commit
  - name: GitLab CLI
    url: https://docs.gitlab.com/cli/ci/lint/
    note: "`glab ci lint`, for GitLab CI"
---

This tool reads the CI workflows as code that runs with the project's secrets. Which checker fits depends on the CI
system; look for the one the project already runs.

## Finding it

The workflows are in the CI directory or file (`.github/workflows/` for GitHub Actions, `.gitlab-ci.yml` for GitLab
CI). Look in CI and in the pre-commit config for a step that already checks them. The checker's config (for example
`.github/actionlint.yaml` or `zizmor.yml`) lists what it ignores.

## Using it

- **Run it on the workflows**: for GitHub Actions, `actionlint` checks the syntax, the expressions and the shell in
  each step, and `zizmor .github/workflows/` reports security findings such as excessive permissions and template
  injection (untrusted input pasted into a command); for GitLab CI, `glab ci lint` checks the syntax.
- **Pin what a workflow pulls in** (an action, an included template, a container image) to a full commit SHA or
  digest, with the version in a comment, so a moved tag cannot change what runs.
- **Hold workflows that run an agent to the strictest rules**: the narrowest permissions, only the secrets they need,
  and no untrusted text in their prompt or commands.
- **Before merge**: run the checker on every pull request that changes a workflow.
