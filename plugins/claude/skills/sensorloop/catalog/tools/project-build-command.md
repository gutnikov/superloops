---
title: The project's build command
summary: Whatever builds this project, found in the project itself rather than assumed.
sensors: [build-and-types]
layer: project
vendors:
  - name: npm
    url: https://docs.npmjs.com/cli/using-npm/scripts
    note: "`npm run build`, JavaScript"
  - name: Cargo
    url: https://doc.rust-lang.org/cargo/
    note: "`cargo build`, Rust"
  - name: Go
    url: https://pkg.go.dev/cmd/go
    note: "`go build ./...`"
  - name: Gradle
    url: https://gradle.org/
    note: "`./gradlew build`, the JVM"
  - name: Maven
    url: https://maven.apache.org/
    note: "`mvn package`, the JVM"
  - name: .NET CLI
    url: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-build
    note: "`dotnet build`"
  - name: Bazel
    url: https://bazel.build/
    note: "`bazel build //...`, several languages"
  - name: Make
    url: https://www.gnu.org/software/make/
    note: any language
---

The project, not the loop, chooses how it is built. This tool is the command the project already builds with, found in
the project before anything is run.

A build does not always check types: a bundler can compile TypeScript without checking it, and many Python projects
have no build at all. Where the build does not check them, the project's type checker covers that part of the sensor.

## Finding it

Look where the project itself builds, in this order:

1. **CI**: the build job a pull request must pass. It is the command the project trusts.
2. **The project's task file**: a `build` script, target or task.
3. **The README or the contributing guide**: the command it tells contributors to run.
4. **The build tool's default**, read off its file (`package.json`, `Cargo.toml`, `go.mod`, `build.gradle`).

When these disagree, CI wins: it decides whether a change is merged. When none of them names a command, ask a person
rather than guess.

## Using it

- **The whole build before the work counts as done**, run as CI runs it.
- **The part that changed, while working**: `cargo build -p <crate>`, `go build ./pkg/...`,
  `bazel build //path:target`.
- **The same flags as CI**: warnings that CI treats as errors are errors locally too.
- **Warm caches**: the build and dependency caches kept between runs make it fast enough to run often. Build from
  clean after the dependencies or the build's config change, since a stale cache can hide an error.
