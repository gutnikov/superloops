---
title: Scripted model responses
summary: Replaces a language model in tests with recorded or scripted responses, so tests of an AI feature give the same result every time.
sensors: [test-runner]
layer: project
vendors:
  - name: VCR.py
    url: https://github.com/kevin1024/vcrpy
    note: Python; recorded HTTP responses
  - name: VCR
    url: https://github.com/vcr/vcr
    note: Ruby; recorded HTTP responses
  - name: nock
    url: https://github.com/nock/nock
    note: Node.js; scripted and recorded HTTP responses
  - name: go-vcr
    url: https://github.com/dnaeon/go-vcr
    note: Go; recorded HTTP responses
  - name: AI SDK
    url: https://ai-sdk.dev/docs/ai-sdk-core/testing
    note: JavaScript; mock models in place of a provider
---

A test of a feature that calls a language model would get a different answer on every run. This tool puts recorded or
scripted responses in the model's place, so the test checks the code around the model and gives the same result every
time.

## Finding it

Look in the test suite for how the project does it: a fake model provider or client, a fixture that starts a mock
model server, or a directory of recorded responses (cassettes). The test dependencies name the recording library, if
there is one. The substitute goes in at the setting that holds the model's address or client; check whether the
project already swaps it there.

When there is none, the plainest start is a fake client at that setting, returning the responses each test scripts.

## Using it

- **Fail on any request without an answer**: a request with no recorded or scripted answer is an error, never a call
  to the real model.
- **Re-record on purpose**: recordings are replaced by a deliberate run and reviewed with the change, never refreshed
  because a test happened to miss one.
- **Scrub secrets**: remove keys, tokens and personal data from recordings before they are committed.
