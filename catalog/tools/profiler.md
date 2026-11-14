---
title: Profiler
summary: Samples where a program spends its time or memory, and shows the functions that cost the most.
sensors: [performance-measure, manual-probe]
layer: project
vendors:
  - name: pprof
    url: https://github.com/google/pprof
    note: Go, and any profile in its format
  - name: py-spy
    url: https://github.com/benfred/py-spy
    note: Python, attached to a running process
  - name: perf
    url: https://perfwiki.github.io/main/
    note: Linux
  - name: async-profiler
    url: https://github.com/async-profiler/async-profiler
    note: Java
  - name: dotnet-trace
    url: https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace
    note: .NET
  - name: Chrome DevTools
    url: https://developer.chrome.com/docs/devtools/performance
    note: the Performance panel, for a page
  - name: speedscope
    url: https://www.speedscope.app/
    note: views the profiles of most of these
---

A benchmark tells that a change made the code slower; a profile shows which functions made it so. Which profiler
applies depends on the language and the runtime.

## Finding it

Look first for the one the project uses: in the dev dependencies, in the README, and a profiling endpoint the service
already serves (`/debug/pprof/` in Go). Many runtimes also ship one: Go's `pprof`, Node's `--cpu-prof`, a browser's
performance panel.

When neither the project nor its runtime has one, ask a person before adding one.

## Using it

1. **Choose one workload** to run before and after the change, a benchmark where there is one, so the two profiles
   compare.
2. **Sample it long enough to see the slow case**, since a short sample misses work that happens rarely:
   `py-spy record -o profile.svg --pid <pid>`, `perf record -g -p <pid>`, or `go tool pprof` on a profile fetched
   from the service.
3. **Compare the two profiles**: `go tool pprof -diff_base=old.prof new.prof`, or both opened in speedscope.

Attaching to a running process often needs extra rights (root, or the system's ptrace and perf settings), and a
container may block it. When attaching fails, start the program under the profiler instead:
`py-spy record -o profile.svg -- python <script>`, `perf record -g -- <command>`.
