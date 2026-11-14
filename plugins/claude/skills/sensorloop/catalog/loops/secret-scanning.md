---
title: No secrets in commits
summary: A secret scanner checks every commit before it is made and again in CI, and the agent moves each key it finds out of the code. A secret that has already been pushed goes to a person, who revokes it.
sensors: [security-scanner]
when: Before each commit, on the staged changes; in CI, on the commits of every pull request; and on a schedule, over the whole history.
failure: A finding in the staged changes or in the pull request's commits. A new allow comment or ignore entry, which a person has not yet seen. A scan that failed, or wrote no report.
next: "The agent moves the value out of the code, so that the code reads it from an environment variable or the project's secret store, and commits again. A secret found in a commit that was already pushed is not the agent's to fix: it stops and tells a person, who revokes the secret and issues a new one. Only a person approves an allow comment or an ignore entry. A scan that fails twice for a cause outside the change goes to a person with the scanner's output."
---

## The loop

1. The agent commits. A pre-commit hook runs the secret scanner on the staged changes.
2. On a finding, the hook blocks the commit, and the scanner prints the rule, the file and the line, with the secret
   redacted.
3. The agent moves the value out of the code: the code reads an environment variable or the project's secret store,
   and the example environment file, such as `.env.example`, gets a placeholder. It commits again.
4. In CI, the same scanner runs over the pull request's commits. This is the run that counts, since a hook can be
   skipped.
5. A finding in a commit that was already pushed stops the agent. It tells a person the rule, the file and the commit,
   never the value, and the person revokes the secret and issues a new one.

## Why

An agent writing code that needs a key can put the key in the code itself. Once committed, the secret stays in the
history and in every clone, so deleting it later does not help: once pushed, it has to be revoked. A scan before the
commit stops it while it is still only in the agent's working tree.

## Set up

- **The hook.** With the pre-commit framework, Gitleaks ships a hook that runs
  `gitleaks git --pre-commit --redact --staged --verbose`; other scanners, such as detect-secrets, have their own.
  Report a secret's place, never its value.
- **Tell a leak from a failed scan.** Gitleaks exits 1 both on leaks and on an error, so the check reads the JSON
  report to tell them apart, and fails when no report was written.
- **The whole history, on a schedule.** A scanner that checks whether a found credential is live reports only those:
  TruffleHog with `--results=verified`, and `--fail`, which exits 183 on a result. A live credential is an incident
  for a person, not a task for the agent.
- **An existing repository starts from a baseline.** With Gitleaks, `--baseline-path` takes an earlier report, and the
  new run reports only new findings. The old ones go to a person to revoke.
- **False positives are reviewed lines.** A fake key in a test fixture gets an allow comment on its line
  (`gitleaks:allow`) or its fingerprint in the ignore file (`.gitleaksignore`). The check lists each one a change
  adds, so a person sees it before the merge.
- **Confidential is not only a credential.** An agent can write an internal host name, a codename or an unreleased
  product name it saw in a document. A custom rule in the scanner's config finds them, with an allowlist of the names
  already public that a person extends.
- **Out of the agent's reach.** `git commit --no-verify` and `SKIP=gitleaks` skip the hook, so a hook in the agent's
  session refuses both, and refuses the agent's writes to the ignore file and the scanner's config. The CI run
  decides.

## Where it does not apply

A secret the agent never writes to a file, such as one it passes on the command line, does not reach this scanner;
keeping production credentials out of the agent's environment covers that case.
