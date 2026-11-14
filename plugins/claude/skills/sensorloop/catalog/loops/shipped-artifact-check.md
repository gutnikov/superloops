---
title: Check what ships before the channel moves
summary: The release installs the exact package, binary or image it will publish into an empty place and runs it, publishes it without moving the channel pointer, verifies it from the registry, and only then moves the pointer (`latest`, `stable`, an install script). Moving the pointer back does not repair the installs that already failed.
sensors: [structure-check, smoke-probe]
when: On every release, as required steps of the release job between the build and the pointer; and on every pull request, a quick pack, install and run of the package.
failure: "Any step that is not ok: a file missing from a package or one not expected; a version that differs from the tag; a binary, or a library inside it, built for another architecture; a signature that does not verify; an installed copy that does not start or fails its smoke; a version the registry does not serve with its exact files in time; an asset checked only for existing; or a skipped step."
next: The release stops before the pointer moves, and users keep the previous version. The agent reads the failed step's output and fixes the build, the package manifest or the release script through a pull request; it does not run the release, and never changes the reviewed spec of what ships or a release already published. A re-run finishes the same version from the same bytes. When the cause is outside the project, such as a registry or a signing service that is down, or the same step fails after the agent's second fix, it stops and hands a person the step's output.
---

## The loop

The release job runs these steps in order. A red step stops it before the pointer moves.

1. **The commit passed CI.** The tag points at a commit on the main branch whose required checks passed.
2. **Build once.** Each asset is built once and its sha256 recorded in a checksum file. Every later step checks
   those bytes, and nothing rebuilds.
3. **Compare with the reviewed spec.** For each asset: its file list, with nothing missing and nothing unexpected;
   the version it reports, equal to the tag; for a binary, its architecture and signature, in every archive it ships
   in. The native libraries embedded in a binary are checked too: a library of the wrong architecture loads only on
   the machine that needs it, so it ships unnoticed, as an x64 library inside one project's ARM64 Windows build did.
4. **Install it alone and run it**, in an empty directory with a throwaway home directory and install scripts off:
   `--version` equal to the tag, `--help`, and a smoke through the parts only the build bundles. The check proves it
   ran the installed copy: the import resolves inside the install directory, and no tool on the runner's PATH stands
   in for one the package bundles.
5. **Publish without moving the pointer**: under a staging tag (`npm publish --tag <staging>`), as a draft release,
   or to a versioned path that never changes once written. A package that installs others publishes after them,
   once the registry serves each one.
6. **Verify from the registry.** Poll until the registry serves the version with its exact files, then install it
   from the registry and repeat step 4.
7. **Move the pointer last, and only forward.** Every publisher takes one lock, and the pointer moves only to a
   higher version, by compare-and-swap, so a slow older run cannot move it back; an older patch release gets a tag
   of its own. The pointer is written after everything it names, in one write.

A re-run of the same version skips what is published and finishes the rest. A published release is never changed,
and a failure before step 7 deletes the draft.

## Why

The tests run against the workspace: they import the sources, find dependencies the monorepo hoists, and call
tools on the runner's PATH. Users get something else: a tarball with its own file list, a compiled binary with its
assets bundled in, a signed archive, and a pointer that says which version to fetch. Each can be broken while every
test passes. Once the pointer moves, users install what it names, and moving it back does not repair an install that
already failed. A running service is checked by probing it after its deploy; what users install is checked here,
before the pointer moves.

## Set up

- **The spec in the repository, reviewed**: the expected assets and packages, each one's file list, and per target
  the architecture, the signature and, for Linux, the oldest C library version it must run on. Its tests run in a
  required job.
- **A quick version on every pull request.** Pack the package, move it to an empty directory and run it from there:
  `npm pack`, then `npx ./<tarball> --version`; a wheel installed into a fresh virtual environment; `cargo package
  --list` for a crate's files. A broken file list shows on the pull request, not on release day.
- **Every check required, and no skip that moves the pointer.** The final job requires success from every build and
  verify job. A run that skips a verification may publish under the staging tag, but never moves the pointer. A smoke
  test that no release path calls does not count.
- **Every asset checked.** The output names how each asset was checked, and "exists" alone is red. A target no runner
  can execute still gets the checks of its bytes: architecture, signature and file list.
- **One line per asset and step**, `<asset>: <step>: <status>`, such as `cli-windows-arm64.exe: arch: fail (PE x64
  at byte 1048576)` or `latest: pointer: kept (1.5.0 is newer)`. It exits non-zero on any status but `ok`, `kept`
  and `already published`.
- **A container image follows the same order**: the image built for one architecture runs `--version` before the
  images for every architecture are pushed, and its tag moves last.
- **The check is tested.** It must fire on a tarball missing the file its entry point names, a binary whose
  `--version` differs from the tag, an archive with an unsigned copy, a skip that would move the pointer, and an
  older version that would move `latest`. It must pass on the last release's assets and on a re-run of a release
  half published.
- **Out of the agent's reach.** The release runs in CI with credentials the agent never holds. The spec and the
  release workflow have code owners, so the change that breaks an artifact cannot relax its check.
