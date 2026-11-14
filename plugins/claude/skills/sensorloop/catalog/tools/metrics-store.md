---
title: The project's metrics store
summary: Where the project's metrics are kept and queried, with its alert and SLO rules.
sensors: [metrics]
layer: system
vendors:
  - name: Prometheus
    url: https://prometheus.io/
    note: PromQL; Alertmanager routes its alerts
  - name: VictoriaMetrics
    url: https://victoriametrics.com/
    note: answers PromQL
  - name: Grafana Mimir
    url: https://grafana.com/oss/mimir/
    note: long-term storage for Prometheus
  - name: Amazon CloudWatch
    url: https://aws.amazon.com/cloudwatch/
    note: AWS
  - name: Datadog
    url: https://www.datadoghq.com/
  - name: Sloth
    url: https://sloth.dev/
    note: generates the SLO rules for Prometheus
---

The metrics store keeps the metrics of the project's services as time series, and evaluates the project's alert
rules and its service level objectives (SLOs). Which store that is depends on the project's platform: look it up in
the project's configuration, and do not assume one.

## Finding it

- **The monitoring config**: what the metrics are collected from (scrape targets in `prometheus.yml`, the metrics
  exporters of an OpenTelemetry Collector), rule files, and dashboards kept in the repository. Rule files hold alert
  rules, and recording rules: queries the store runs ahead of time and saves as new series.
- **SLO definitions**, if any: the specs that generate the SLO's recording and alert rules.
- **How the agent reaches it**: the store's HTTP API, its command-line client, or an MCP server. The address and the
  credentials come from the project's environment or CI config; when they are not there, ask a person.

When the repository holds no monitoring config, ask a person where the metrics go before setting up a store.

## Using it

- **Query over the store's API**, for example with PromQL in Prometheus and the stores compatible with it:
  `curl -G <server>/api/v1/query --data-urlencode 'query=<expr>'`, or `/api/v1/query_range` for a span of time.
- **Compare versions by the label that carries the version** (`version="<new>"` against `version="<old>"`), over the
  same window, while both versions serve the same traffic side by side.
- **Check that a query returns series** before trusting its value: an empty result is no data, not zero.
- **Check rules before they ship** with the store's own checker: `promtool check rules <rule-file>` and
  `promtool test rules <test-file>` in Prometheus.
