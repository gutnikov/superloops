---
title: Security scan of the running preview
summary: A dynamic security scanner probes the deployed preview from outside, the way an attacker would, with a passive scan on every deploy and an active scan with attacks before a release. The agent fixes each alert that the project's rules file marks as a failure.
sensors: [security-scanner]
when: After each deploy of a pull request's preview, once it is ready, a passive scan; nightly and before each release, an active scan against the preview or staging.
failure: An alert on a rule that the rules file sets to fail. A scan that ended in an error, or whose crawl reached no page, also fails, since it has observed nothing.
next: The agent reads the report, fixes the cause in the code or in the server's configuration and pushes, and the preview is scanned again; it never edits the rules file. An alert it holds to be a false positive or an accepted risk, it proposes as an ignore line with its reason, and only a person approves it. When the same alert still fails after three rounds, or the scan fails for a cause outside the change, such as a crawl that cannot log in, the agent stops and hands a person the report with the alert's rule and URLs.
---

## The loop

1. The preview is deployed and ready. A CI job runs the scanner against its address, in a container, with the
   project's rules file, which sets each rule to fail, warn or ignore.
2. On every deploy, a passive scan crawls the app for a set time and only reads the responses. It flags problems such
   as a missing security header or a cookie without the Secure flag, and takes minutes.
3. Nightly and before each release, an active scan sends attacks, such as SQL injection, to every page the crawl
   found. For an API, an API scan takes its OpenAPI, SOAP or GraphQL description and attacks each endpoint in it,
   including those no crawler finds. An active scan can run for hours.
4. The job saves the full report and the exit code, and prints one line per alert that fails,
   `<rule id> <rule name>: <url>`, then the number of warnings.
5. The agent reads the failing alerts, fixes their cause (a header, a cookie's flags, an unescaped parameter) and
   pushes. The preview is deployed and scanned again, until no alert fails.

## Why

Some vulnerabilities exist only in the running app: a missing security header, a cookie without the Secure flag, an
injection that shows only through the deployed stack with its proxy and its configuration. Reading the code does not
reveal them, and a scanner of the source sees patterns in the code, not what the deployed stack answers. A
scanner that probes the app from outside finds them while the change is still on a preview, before it is released.

## Set up

- **A scanner in CI**, such as ZAP or Nuclei, run as a container against the preview's address. In ZAP,
  `zap-baseline.py` is the passive scan, `zap-full-scan.py` the active one and `zap-api-scan.py` the API scan, and
  `-J report.json` writes the full report.
- **Test data only.** An active scan sends attack payloads and writes data. Run it only against an environment the
  project owns that holds no real user data, never against production. Pages behind a login need a test account, kept
  in the CI system's secrets.
- **A time limit on every scan.** ZAP's full scan crawls with no time limit by default; `-m` sets the minutes, and a
  timeout on the job ends a long scan as red rather than never.
- **The rules file is the policy.** `zap-baseline.py -g zap.conf` writes a file with every rule at WARN. The project
  sets each rule to FAIL, WARN or IGNORE, keeps the file in the repository and passes it with `-c`. Start with FAIL on
  the rules the project cares about, and move a rule to FAIL once its warnings are fixed. Each IGNORE is an accepted
  risk: it carries its reason, and a person approves it in review.
- **A scan that did not run is not a pass.** ZAP exits 0 on success, 1 on at least one FAIL, 2 on warnings without a
  FAIL, and 3 on any other failure. The job fails on 1 and 3, and on a crawl that reached no page.
- **The check is tested on recorded reports.** It must fire on a report with a FAIL alert, such as Cookie Without
  Secure Flag (rule 10011) on the login response, and on a scan that ended with exit code 3. It must pass on a report
  with only WARN and IGNORE alerts.
- **Out of the agent's reach.** The scan runs in the pipeline against the deployed preview, not in the agent's
  session. A hook refuses the agent's writes to the rules file, so it cannot turn a FAIL into an IGNORE; it reads the
  report and fixes the app.

## Where it does not apply

The scanner finds known kinds of problems at the addresses it reaches. A page the crawl never finds, or a flaw in the
app's own rules, such as one user reading another user's order, passes unseen; those need tests and review. A library
or a command-line tool has no running app to scan.
