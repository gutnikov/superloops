---
title: Rollout controller
summary: Rolls a release out step by step, checks it against metrics at each step, and rolls it back on failure.
sensors: [smoke-probe, metrics]
layer: system
vendors:
  - name: Argo Rollouts
    url: https://argoproj.github.io/rollouts/
    note: Kubernetes
  - name: Flagger
    url: https://flagger.app/
    note: Kubernetes
  - name: AWS CodeDeploy
    url: https://aws.amazon.com/codedeploy/
    note: AWS
  - name: Google Cloud Deploy
    url: https://cloud.google.com/deploy
    note: Google Cloud
  - name: Kayenta
    url: https://github.com/spinnaker/kayenta
    note: the canary analysis alone, from Spinnaker
---

A rollout controller moves traffic from the old version to the new one in steps, checks the new one at each step,
and rolls back when a check fails. It is part of the deployment platform: look for it in the platform's
configuration, and do not assume there is one.

## Finding it

- **On Kubernetes**: a `Rollout` resource (Argo Rollouts) or a `Canary` resource (Flagger) beside or in place of a
  plain `Deployment`. A plain `Deployment` alone also rolls out in steps, but it waits only for readiness probes,
  checks no metrics and does not roll back by itself.
- **Outside Kubernetes**: a canary or step-by-step setting in the deploy service, with the alarms that stop it
  (deployment configurations in AWS CodeDeploy), or a canary stage in the delivery pipeline (Spinnaker).
- **The analysis**: an `AnalysisTemplate` in Argo Rollouts, or the metric checks in Flagger, naming the queries and
  their limits.
- **Access** through the platform's client, and the controller's own plugin or dashboard (`kubectl argo rollouts`).

When there is none, adding one is a decision for the people who run the platform: ask a person.

## Using it

- **Run a smoke test at a step**, against the new version's health endpoints or main paths, before it takes more
  traffic: a `job` metric in an Argo Rollouts analysis, a `pre-rollout` or `rollout` webhook in Flagger.
- **Compare the new version with the old** under the same traffic, not only with a fixed limit.
- **Fail a step that gets no metric data**: no data is not ok, so the rollout stops rather than going through.
- **Follow a rollout to its end**: `kubectl argo rollouts get rollout <name> --watch` in Argo Rollouts, or
  `kubectl get canary <name> --watch` in Flagger.
- **Check the rollback itself** (`kubectl argo rollouts abort <name>`, or the controller's own rollback when a check
  fails): the old version is healthy again afterwards.
