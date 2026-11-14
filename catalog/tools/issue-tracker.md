---
title: The issue tracker
summary: Where bugs, requests and their discussion are kept, with templates that make a report complete.
sensors: [human-review, user-feedback]
layer: system
vendors:
  - name: GitHub Issues
    url: https://docs.github.com/en/issues
    note: issue forms as templates
  - name: GitLab Issues
    url: https://docs.gitlab.com/user/project/issues/
  - name: Jira
    url: https://www.atlassian.com/software/jira
  - name: Linear
    url: https://linear.app/
---

The tracker is a service outside the repository, but the clues to which one the project uses are inside it. Look for
them rather than assume a tracker.

## Finding it

- **The README or the contributing guide**: where it tells people to report a bug.
- **Issue templates** in the repository (`.github/ISSUE_TEMPLATE/`, `.gitlab/issue_templates/`).
- **References in commits and branch names**: a key such as `PROJ-123`, or `#123`.

The agent reaches the tracker through the code host's client (`gh issue`, `glab issue`), the tracker's API, or an MCP
server that gives the agent the tracker's tools. When the clues name no tracker, or the agent cannot reach the one
they name, ask a person: choosing a tracker and granting access to it are the team's decisions.

## Using it

- **Query rather than read everything**: by label, state and date, for example
  `gh issue list --label bug --state open`.
- **File reports through the template**, which asks for the steps, the expected and actual result, and the
  environment, so a report can be reproduced.
- **Link each issue to the change that fixes it**, so either can be found from the other.
- **Count what users report** (User feedback): group the issues users file by label or topic, with how many users
  raised each, duplicates and votes included.
- **Read a person's bug report as a review** (Human review): it says how the result differs from what was wanted.
