---
title: Fault proxy
summary: Sits between a service and a dependency in tests, and makes that dependency slow, cut off or broken on demand.
sensors: [input-fault-injection]
layer: project
vendors:
  - name: Toxiproxy
    url: https://github.com/Shopify/toxiproxy
    note: any TCP connection; latency, bandwidth, a cut
  - name: WireMock
    url: https://wiremock.org/
    note: delays and faults, for a dependency reached over HTTP
  - name: Envoy
    url: https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/fault_filter
    note: its fault filter, where traffic already passes through Envoy
  - name: netem
    url: https://man7.org/linux/man-pages/man8/tc-netem.8.html
    note: Linux; delay and loss on a network interface
---

The service under test reaches one of its dependencies only through the proxy, and each test tells the proxy which
fault to add. It works at the network level, so it serves a service in any stack.

## Finding it

- **The test setup**: a proxy container in the Compose file or the test fixtures, and its client library among the
  test dependencies.
- **The service's test config**: the dependency's address points at the proxy's port, not at the dependency. Without
  that, the proxy is there but unused.

When the project has no fault proxy, add one as one more container in the test setup, and point the service's address
for the dependency at the proxy.

## Using it

- **Add a fault in the test that needs it**, through the client or the proxy's HTTP API: latency, a timeout, a reset
  connection, limited bandwidth, or the proxy disabled to cut the dependency off.
- **Reset after each test** (`POST /reset` in Toxiproxy), so one test's fault cannot break the next.
- **Assert on what the service does**: it times out within its limit, falls back, or returns a clear error.
