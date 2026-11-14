---
title: Throwaway dependencies
summary: Starts real dependencies (a database, a queue, a cloud API emulator) in containers for one test run, and removes them after it.
sensors: [test-runner]
layer: project
vendors:
  - name: Testcontainers
    url: https://testcontainers.com/
    note: Java, Go, Python, .NET, Node.js and more
  - name: Docker Compose
    url: https://docs.docker.com/compose/
  - name: LocalStack
    url: https://www.localstack.cloud/
    note: an emulator of AWS services, started as one of the containers
  - name: Azurite
    url: https://github.com/Azure/Azurite
    note: an emulator of Azure Storage
---

The tests meet the real database or queue rather than a mock of it, and every run starts from the same clean state.

## Finding it

Look in the test dependencies for a container library that starts containers from the test code, and in the
repository for a Compose file the tests use. CI shows how the project starts them and which container runtime it
expects; the same runtime must be available wherever the tests run.

When the project has neither, add the container library for the project's test language, or a Compose file that the
test command starts before the tests and removes after them.

## Using it

- **Pin image versions**: a fixed tag or digest, never `latest`, so a run today and a run next month test against the
  same dependency.
- **Wait until ready**: a health check, an open port or a log line, never a fixed sleep.
- **Share nothing between runs**: a fresh container or a fresh database for each run, removed at the end
  (`docker compose down -v` removes the volumes too).
- **Say when it could not start**: without a container runtime, the tests that need one did not run. Report that; it
  is not a pass.
