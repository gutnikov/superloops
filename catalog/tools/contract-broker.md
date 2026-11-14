---
title: Contract broker
summary: Stores the contracts consumers expect from a service and the provider's verification of each, so a deploy can ask whether it is safe.
sensors: [test-runner]
layer: system
vendors:
  - name: Pact Broker
    url: https://github.com/pact-foundation/pact_broker
    note: open source, run by the team
  - name: PactFlow
    url: https://pactflow.io/
    note: a hosted broker
---

A contract is what one consumer expects of a service: the requests it sends and the responses it relies on, usually
recorded from the consumer's own tests. The broker also records which versions run in each environment, so it can
say whether one version is safe to release to one environment.

## Finding it

A service outside the repository, run by the team or hosted. Its address and token are in the project's CI
configuration, where consumer builds publish contracts and provider builds publish results. From anywhere else, the
agent reaches it through the broker's command-line client or its HTTP API.

When the CI configuration names no broker, the project does not use one. Setting one up changes the builds of every
consumer and provider, so it is a decision for a person.

## Using it

- **Publish**: each consumer build publishes its contracts, with its version and branch.
- **Verify**: the provider's contract tests fetch the contracts it must honour, replay each one against the provider,
  and publish the result for the provider's version.
- **Before a deploy**: `can-i-deploy`, with the version and the target environment, answers yes or no, with the
  contracts behind the answer.
- **After a deploy**: `record-deployment`, so the next question is checked against what is really running there.
