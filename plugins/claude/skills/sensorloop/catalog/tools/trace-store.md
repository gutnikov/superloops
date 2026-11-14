---
title: The project's trace store
summary: Where the project's traces are collected and queried, fed by the instrumentation in its code.
sensors: [traces, performance-measure]
layer: system
vendors:
  - name: OpenTelemetry
    url: https://opentelemetry.io/
    note: the SDKs in the code, and the Collector that forwards traces
  - name: Grafana Tempo
    url: https://grafana.com/oss/tempo/
    note: TraceQL
  - name: Jaeger
    url: https://www.jaegertracing.io/
  - name: Zipkin
    url: https://zipkin.io/
  - name: Honeycomb
    url: https://www.honeycomb.io/
  - name: AWS X-Ray
    url: https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html
    note: AWS
---

The trace store collects the spans the instrumented code sends, one per operation, and answers queries about requests
as they crossed the services. The instrumentation and the store differ from project to project: look both up in the
project's code and configuration, and do not assume them.

## Finding it

- **The instrumentation**, the library that records spans: an OpenTelemetry SDK or a vendor's tracing library (such
  as Datadog's `dd-trace`) in the dependency manifest, and its setup in the service's start-up code.
- **Where spans go**: the `OTEL_EXPORTER_OTLP_ENDPOINT` variable, the exporters in an OpenTelemetry Collector's
  config, or the vendor library's own settings.
- **How the agent reaches the store**: its HTTP API (search with TraceQL in Tempo, the query API in Jaeger), or an
  MCP server.

When the project has no tracing, ask a person before adding it: instrumenting the code and running a store are
choices for the whole project.

## Using it

- **Search by service, status and duration**: `{ resource.service.name = "api" && status = error }` or
  `{ duration > 2s }` in TraceQL.
- **Fetch one trace by its id**, to see which span failed or took the time.
- **Sample everything** in tests and checks: a trace that was sampled out was never recorded.
- **In tests, collect spans in memory** with an in-memory exporter (`InMemorySpanExporter` in the OpenTelemetry SDKs),
  so assertions run on them with no store.
