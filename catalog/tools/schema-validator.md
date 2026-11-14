---
title: Schema validator
summary: Validates a YAML or JSON file against its JSON Schema, and names the field that breaks it.
sensors: [structure-check]
layer: project
vendors:
  - name: check-jsonschema
    url: https://github.com/python-jsonschema/check-jsonschema
    note: Python; a pre-commit hook
  - name: Ajv
    url: https://ajv.js.org/
    note: JavaScript
  - name: Sourcemeta JSON Schema CLI
    url: https://github.com/sourcemeta/jsonschema
    note: one binary
---

A schema validator catches a malformed config before the program that reads it does: a missing field, or a string
where a number belongs.

## Finding it

Look for the schemas in the repository (`*.schema.json` files, a `schema/` directory) and for the step that validates
against them: a pre-commit hook, a task, a CI job. Many common formats have a published schema in the JSON Schema
Store.

## Using it

- **Run it**: `check-jsonschema --schemafile <schema> <files>`, or `ajv validate -s <schema> -d <file>` with ajv's
  command-line client.
- **Keep the schema next to what it describes**: a change to one is then reviewed with the other.
- **Check on commit and in CI**: a pre-commit hook gives the signal early, and the same check in CI catches a commit
  that skipped the hook.
- **Pin a fetched schema**: a schema read from the web can change on its own; keep a copy or pin its version.
