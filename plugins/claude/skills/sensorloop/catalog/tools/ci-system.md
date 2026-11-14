---
title: The CI system
summary: Where the project's checks run on every pull request and push, with each job's status and log.
sensors: [ci-results]
layer: system
vendors:
  - name: GitHub Actions
    url: https://docs.github.com/en/actions
    note: read with `gh run view --log-failed`
  - name: GitLab CI/CD
    url: https://docs.gitlab.com/ci/
    note: read with `glab ci`
  - name: Jenkins
    url: https://www.jenkins.io/
  - name: CircleCI
    url: https://circleci.com/
  - name: Buildkite
    url: https://buildkite.com/
  - name: Azure Pipelines
    url: https://azure.microsoft.com/en-us/products/devops/pipelines
---

The CI system runs the project's checks on every pull request and push, outside the agent's reach. Which system the
project uses shows in the repository, and the agent reads its runs and logs through the code host's command-line
client or API.

## Finding it

- **The config in the repository**: `.github/workflows/` (GitHub Actions), `.gitlab-ci.yml` (GitLab CI), a
  `Jenkinsfile`, `.circleci/config.yml`.
- **The required checks**: the protected branch's settings on the code host.
- **Access**: the code host's client (`gh`, `glab`), signed in with a token that may read runs and logs.

When the repository has no CI config, there is no CI to read. Adding one is a change a person reviews, since the agent
would be writing the checks that judge its own work.

## Using it

- **The checks of a pull request**: `gh pr checks <number>`, or `glab ci status` on its branch. A pending, skipped or
  missing check is not a pass.
- **The run of this exact commit**: `gh run list --commit <sha>` finds it, and `gh run watch <run-id>` or
  `glab ci status --live` waits for it to end. Until it ends, the commit has no result; a run for an earlier commit
  says nothing about this one.
- **The failing step's log only**: `gh run view <run-id> --log-failed`, or `glab ci trace <job-id>`. A system outside
  the code host, such as Jenkins or CircleCI, reports its status on the pull request with a link to its own log; read
  that log through the system's API.
- **Slow checks on a schedule**: a nightly run for checks too slow for every push, and a matrix of platforms where the
  project supports several.
