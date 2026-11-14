---
title: Load generator
summary: Sends a scripted load to a running service, and reports latency percentiles and errors against thresholds.
sensors: [performance-measure]
layer: project
vendors:
  - name: k6
    url: https://k6.io/
    note: scripts in JavaScript, with thresholds
  - name: Gatling
    url: https://gatling.io/
    note: JVM
  - name: Locust
    url: https://locust.io/
    note: Python
  - name: Apache JMeter
    url: https://jmeter.apache.org/
    note: Java
  - name: Artillery
    url: https://www.artillery.io/
    note: scenarios in YAML; JavaScript
  - name: Vegeta
    url: https://github.com/tsenart/vegeta
    note: HTTP at a constant rate, from the command line
---

A load generator runs against a copy of the service that can take the load, never against production.

## Finding it

Look for load scripts in the repository (k6 scripts, Gatling simulations, a `locustfile.py`) and in CI for a job,
often scheduled, that runs them. That job names the target: a preview or a staging environment.

When the repository has no load scripts, or no environment can take the load, ask a person before setting one up.

## Using it

- **Put thresholds in the script**: limits on p95 latency (the time 95% of requests finish within) and on the error
  rate, so the run fails by its exit code: `thresholds` in k6, assertions in Gatling, a `quitting` event hook that
  sets the exit code in Locust.
- **Run it**: `k6 run <script>`, `locust -f locustfile.py --headless -u <users> -r <rate> --run-time <duration>`, or
  Gatling through its build plugin.
- **Keep runs comparable**: the same script, load and environment size each time, with the version under test
  recorded beside the result.
