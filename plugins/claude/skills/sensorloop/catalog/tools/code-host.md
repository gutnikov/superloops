---
title: The code host
summary: Where the project's pull requests, reviews, checks and protected branches live, reached from the command line or its API.
sensors: [human-review, ci-results, flow-metrics, human-answer]
layer: system
vendors:
  - name: GitHub
    url: https://github.com/
    note: "`gh`"
  - name: GitLab
    url: https://about.gitlab.com/
    note: "`glab`"
  - name: Bitbucket
    url: https://bitbucket.org/
  - name: Azure Repos
    url: https://azure.microsoft.com/en-us/products/devops/repos
    note: "`az repos`"
  - name: Gitea
    url: https://about.gitea.com/
    note: self-hosted; `tea`
  - name: Forgejo
    url: https://forgejo.org/
    note: self-hosted
---

The code host's settings decide which reviews and checks a change needs before it merges. What it reports comes from
people and from CI, not from the agent's own account.

## Finding it

The git remote names the host (`git remote -v`). The host's command-line client, logged in, reads pull requests,
reviews and checks. Settings such as branch protection and deployment environments are read through its API (`gh api`,
`glab api`). The rules live in those settings and in the repository's `CODEOWNERS` file.

## Using it

- **Reviews** (Human review): `gh pr view --comments` on GitHub, `glab mr view --comments` on GitLab, for the
  approvals and the changes asked for.
- **Checks** (CI results): `gh pr checks <number>` on GitHub, `glab ci status` on the branch on GitLab.
  `gh pr checks --required` keeps only the checks a merge needs; a failed check that is not required does not block it.
- **Required reviews and checks**: branch protection and the `CODEOWNERS` file say which reviews and checks a merge
  needs. Read them to know what a merge waits for; changing them needs the repository's admin rights.
- **An approval before a deploy** (Human answer): a deployment environment with required reviewers holds the deploy
  until someone approves or rejects it, and that choice is the answer.
- **History** (Delivery flow metrics): `gh api` or `glab api` returns pull requests and their reviews with timestamps
  (opened, first review, merged), from which flow metrics are computed over weeks.
