---
title: Schema-driven API tester
summary: Generates requests from an API's schema, sends them to the running API, and checks every response against the schema.
sensors: [api-compatibility, input-fault-injection]
layer: project
vendors:
  - name: Schemathesis
    url: https://schemathesis.io/
    note: OpenAPI and GraphQL
  - name: RESTler
    url: https://github.com/microsoft/restler-fuzzer
    note: OpenAPI, with requests chained by state
  - name: EvoMaster
    url: https://github.com/WebFuzzing/EvoMaster
    note: OpenAPI, GraphQL and RPC
  - name: CATS
    url: https://github.com/Endava/cats
    note: OpenAPI
---

A schema-driven API tester tries the requests nobody wrote a test for, malformed ones included. A response that does
not match the schema shows that the API has drifted from its description; a server error on an odd request shows a
case the code does not handle.

## Finding it

It needs two things from the project: the API's schema (an OpenAPI or GraphQL document, in the repository or served by
the API) and a running copy of the API, started locally or on a preview. Look in CI for a job that already runs a
tester against one.

## Using it

- **Point it at test data only**: a local copy or a preview, never production, since it sends malformed and unexpected
  requests.
- **Authenticate**: give it a test account's token, so it reaches more than the login endpoint.
- **Run it** with the schema and the API's base address, for example `schemathesis run`. Read its `--help` first:
  Schemathesis's flags have changed between versions.
- **Keep each failure**: the tester reports the failing request, often as a command to replay. Write that request into
  a regular test in the project's suite, so the failure cannot come back unseen.
