---
title: The project's error tracker
summary: Where the project's production errors are grouped into issues, with stack traces, counts and the releases they appear in.
sensors: [error-tracker]
layer: system
vendors:
  - name: Sentry
    url: https://sentry.io/
    note: with an MCP server for the agent
  - name: Rollbar
    url: https://rollbar.com/
  - name: BugSnag
    url: https://www.bugsnag.com/
  - name: Honeybadger
    url: https://www.honeybadger.io/
  - name: Firebase Crashlytics
    url: https://firebase.google.com/docs/crashlytics
    note: mobile apps
  - name: GlitchTip
    url: https://glitchtip.com/
    note: open source, and takes Sentry's SDKs
---

The error tracker receives the errors the product raises for real users, groups them into issues and counts them by
release. Look up which service the project uses in its code and configuration; do not assume one.

## Finding it

- **The SDK** in the dependency manifest, and its initialisation in the start-up code, with its key from the
  environment.
- **The release setting**: how each event is tagged with the version, usually set at build or deploy time, and the
  deploy step that tells the tracker a release went out.
- **How the agent reaches it**: the service's API, its command-line client (such as `sentry-cli`), or its MCP server,
  with a token that can only read.

When the manifest has no tracker SDK, or the agent has no token, ask a person: the service and access to it are the
project's choice. When events carry no release, add the release setting before reading the tracker for a fix: without
it, an issue that stopped and one that came back look the same.

## Using it

- **Query by release and environment**, sorted by frequency, over a time window.
- **Ask about the release that holds a fix** only once it is running: until then the fix is not deployed yet, and the
  old release says nothing about it.
