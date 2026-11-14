---
title: Fuzzer
summary: Feeds a function a stream of mutated inputs guided by coverage, and keeps each input that crashes it.
sensors: [input-fault-injection]
layer: project
vendors:
  - name: libFuzzer
    url: https://llvm.org/docs/LibFuzzer.html
    note: C and C++, with sanitizers such as AddressSanitizer
  - name: AFL++
    url: https://aflplus.plus/
    note: C, C++ and compiled binaries
  - name: Go's fuzzing
    url: https://go.dev/doc/security/fuzz/
    note: "`go test -fuzz`"
  - name: cargo-fuzz
    url: https://github.com/rust-fuzz/cargo-fuzz
    note: Rust
  - name: Atheris
    url: https://github.com/google/atheris
    note: Python
  - name: Jazzer
    url: https://github.com/CodeIntelligenceTesting/jazzer
    note: Java and the JVM
  - name: OSS-Fuzz
    url: https://google.github.io/oss-fuzz/
    note: runs these fuzzers without pause for open-source projects
---

A fuzzer calls one function, the fuzz target, with inputs it keeps mutating, and follows coverage towards new paths.
The fuzzer is tied to the language and the build; look for the one the project already uses.

## Finding it

- **Fuzz targets in the code**: `func FuzzXxx(f *testing.F)` in Go test files, a `fuzz/` folder made by cargo-fuzz,
  `LLVMFuzzerTestOneInput` in C and C++.
- **The corpus**: the inputs the fuzzer starts from, and those it kept because they reached new code. The starting
  inputs sit beside the targets in the repository (`testdata/fuzz/` in Go, `fuzz/corpus/` for cargo-fuzz).
- **CI**: a fuzzing job, often a scheduled one, and the time it is given.

## Using it

- **Run one target for a fixed time**: `go test -fuzz=FuzzParse -fuzztime=60s ./parser`, or
  `cargo fuzz run parse -- -max_total_time=60`.
- **Build with sanitizers** (`-fsanitize=fuzzer,address` with Clang), so a memory error crashes instead of passing
  quietly.
- **Short runs on a change, long runs on a schedule**, each starting from the corpus earlier runs left. A CI runner
  starts clean, so save the corpus between runs as a cache or an artifact (Go keeps the inputs it adds in
  `$GOCACHE/fuzz`); otherwise every run starts again from the starting inputs.
- **Replay a crash** from the input file the fuzzer saved: Go replays `testdata/fuzz/` on a plain `go test`.
