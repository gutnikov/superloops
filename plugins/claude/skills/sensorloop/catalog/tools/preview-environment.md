---
title: Preview environment
summary: A running copy of the change, deployed for each pull request at its own address, for the checks that need the app to run.
sensors: [browser-run, smoke-probe, security-scanner, performance-measure]
layer: system
vendors:
  - name: GitLab review apps
    url: https://docs.gitlab.com/ci/review_apps/
  - name: Vercel
    url: https://vercel.com/docs/deployments/environments
    note: a preview deployment per branch
  - name: Netlify
    url: https://docs.netlify.com/deploy/deploy-types/deploy-previews/
    note: deploy previews
  - name: Cloudflare Workers
    url: https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/
    note: preview URLs per version
  - name: Render
    url: https://render.com/docs/preview-environments
    note: preview environments, services and databases included
  - name: Argo CD
    url: https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Pull-Request/
    note: a namespace per pull request in Kubernetes
---

Checks point at the preview's address: a Browser run, a Smoke and health probe, a Security scanner that probes the
running app from outside, a Performance measurement. A reviewer can open the same address and see the change.

## Finding it

The project's CI or deployment configuration creates it: a deploy job for each pull request, or a hosting platform
connected to the repository. Its address is posted on the pull request, as a comment or a deployment, and the code
host's command-line client or API reads it from there. When no address appears, the deploy job's log says whether the
deployment failed or did not run.

When the project has no previews, the checks start the app in CI instead. Adding previews needs a hosting account, and
each running copy costs money, so a person decides.

## Using it

- **Wait until it is ready** before any check starts: the deployment has succeeded and the app answers. Give the wait
  a time limit, and report a preview that never answers as not ready: a check that never ran says nothing about the
  change.
- **Check that it runs the commit under test**, not an earlier push: read the version from the deployment or from an
  endpoint the app serves.
- **Use test data only**: no copy of production data and no real users' accounts.
- **Remove it after merge or close**, in the same configuration that creates it, so old previews neither pile up nor
  answer for a change that is gone.
