---
title: Dynamic security scanner
summary: Probes a running copy of the app from outside, and reports each address with its alert, such as a missing security header or a parameter open to injection.
sensors: [security-scanner]
layer: system
vendors:
  - name: ZAP
    url: https://www.zaproxy.org/
    note: formerly OWASP ZAP; a baseline scan for CI
  - name: Nuclei
    url: https://github.com/projectdiscovery/nuclei
    note: checks written as templates
  - name: Burp Suite
    url: https://portswigger.net/burp
    note: commercial; its scanner comes with the paid editions
---

A dynamic security scanner attacks a running copy of the app from outside, as a client would, whatever the app is
built with. It runs as a container or a service, and is aimed only at an environment the project owns.

## Finding it

- **CI**: a job that scans the preview or staging after it is deployed, and the rules file that sets which alerts
  fail the job.
- **The target**: the address of the preview or staging, from the deployment config or the pull request.
- **Credentials**: a test account for the parts behind a login, kept in the CI system's secrets.

## Using it

- **A baseline scan on each change**: it crawls and only reads the responses, in minutes, and flags problems such as
  missing security headers (`zap-baseline.py -t <url>` in ZAP's container).
- **A full, active scan on a schedule**: it sends attacks such as SQL injection, takes long and writes data.
- **For an API, a scan from its OpenAPI description** (`zap-api-scan.py`): it reaches endpoints no crawler finds.
- **Fail only on the alerts the rules file marks**: the file sets which alerts fail the job, which only warn and which
  are ignored, each with a reason.
- **Only against a preview or staging with test data**, never production.
