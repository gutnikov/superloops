---
title: Page audit
summary: Loads a page and scores its performance, accessibility and best practices, with the audits that cost it points.
sensors: [performance-measure, browser-run]
layer: project
vendors:
  - name: Lighthouse
    url: https://developer.chrome.com/docs/lighthouse
  - name: Lighthouse CI
    url: https://github.com/GoogleChrome/lighthouse-ci
    note: Lighthouse in CI, with minimum scores to assert
  - name: PageSpeed Insights
    url: https://pagespeed.web.dev/
    note: Lighthouse with field data, for a public page
  - name: WebPageTest
    url: https://www.webpagetest.org/
  - name: Unlighthouse
    url: https://unlighthouse.dev/
    note: Lighthouse over every page of a site
---

A page audit needs a running copy of the app, usually a preview, and a browser to load it in.

## Finding it

Look for the audit's config in the repository (`lighthouserc.json` or `.lighthouserc.*` for Lighthouse CI) and in CI
for the job that runs it. The config lists the pages, the number of runs and the assertions; the job names the address
it audits.

When there is none, `npx lighthouse <url>` still audits one page with no config; ask a person before adding the CI
job. Without a preview, audit a production build started on the machine: a development server serves code that is not
optimised, and its performance score misleads.

## Using it

- **Take the median of three runs or more**: scores vary from run to run (`numberOfRuns` in Lighthouse CI).
- **Assert per page**: a minimum score per category or a limit per metric, so the job fails on what got worse.
- **Keep the conditions the same every time**: the audit run on the same kind of machine, with the same throttling
  (the slow network and CPU the audit simulates) and nothing else heavy running there.
- **Audit one page while working**: `npx lighthouse <url> --output=json` audits a single page; `lhci autorun` runs
  the whole config as CI does.
