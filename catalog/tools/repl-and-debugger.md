---
title: The language's REPL and debugger
summary: "The interactive tools of the project's language: a REPL to call the code, a debugger to stop it and read its values."
sensors: [manual-probe]
layer: project
vendors:
  - name: Python
    url: https://docs.python.org/3/library/pdb.html
    note: "`python -c` and `pdb`"
  - name: Node.js
    url: https://nodejs.org/api/debugger.html
    note: "`node -e` and `node inspect`"
  - name: Delve
    url: https://github.com/go-delve/delve
    note: Go
  - name: JShell
    url: https://docs.oracle.com/en/java/javase/21/jshell/introduction-jshell.html
    note: Java
  - name: LLDB
    url: https://lldb.llvm.org/
    note: C, C++, Rust, Swift
  - name: GDB
    url: https://www.sourceware.org/gdb/
    note: C, C++, Rust
  - name: Debug Adapter Protocol
    url: https://microsoft.github.io/debug-adapter-protocol/
    note: drives any debugger that speaks it
---

Most languages have a REPL to call the code and a debugger to stop it and read its values. Some, such as Go and Rust,
ship no REPL, and a short program run once takes its place. Which REPL and debugger a project has depends on its
language and setup, so look for them in the project rather than assume them.

## Finding it

- **The language and its environment**: the manifest (`pyproject.toml`, `package.json`, `go.mod`) and where the
  project's interpreter lives (a virtual environment, a version file).
- **A project console**, if there is one: `python manage.py shell`, `rails console`, `iex -S mix`.
- **The debugger**: built in (`pdb`, `node inspect`) or a development dependency (Delve). When the project has none
  and the work needs one, add it as a development dependency.

## Using it

- **Drive them with scripts**, not interactive sessions: a one-line command or a short file run once, such as
  `python -c 'from app.prices import total; print(total([]))'`.
- **Give the debugger its commands up front**, from the command line or a file, so a run stops, prints and exits on
  its own: `python -m pdb -c 'break app/prices.py:12' -c continue -c 'p items' -c quit script.py`, or a file of
  commands passed to Delve with `dlv debug --init <file>`.
- **Run inside the project's environment** (its virtual environment, its config), so values match what the tests
  see.
- **Remove debug output and breakpoints** before the work counts as done.
