---
title: Audit the preview's pages
summary: A page audit loads the preview's main pages in a browser several times and scores them, and fails when a score falls below the project's threshold, such as performance under 0.9. The agent reads the report to find the audits that cost the points, and fixes them.
sensors: [performance-measure, browser-run]
when: In a CI job after each deploy of a pull request's preview, once the preview is ready. While it works, the agent may audit one page against its own preview.
failure: An assertion at the error level fails, such as a category score under its minimum or a metric over its limit, with the performance assertions judged on the median of the runs. A page the audit could not load has measured nothing, and fails too.
next: The agent opens the report of the representative run for the failing page, fixes the audits that cost the points and pushes, and the audit runs again; it never lowers a threshold, which only a person changes. When the same assertion still fails after three rounds, or the cause is outside the code it may change, such as a third-party script or a preview smaller than production, it stops and hands a person the failing assertions and the report.
---

## The loop

1. The preview is ready. A CI job runs the page audit on each page in the audit's config, three times or more, in
   a browser under the same simulated slow network and CPU each time.
2. It checks the assertions in the config. In Lighthouse CI, `"categories:performance": ["error", {"minScore": 0.9}]`
   fails when the performance score is under 0.9; others set a minimum score for accessibility, or a limit on a
   metric, such as `"first-contentful-paint": ["error", {"maxNumericValue": 2000}]` in milliseconds.
3. It prints one line per page and failed assertion, with the expected and the actual value, and exits non-zero on
   any failure at the `error` level. A failure at the `warn` level is printed and does not fail the job.
4. It writes the reports to a directory, with a manifest that names, for each run, the page, its scores, the paths of
   its reports and whether it is the representative run, the median one.
5. The agent opens the JSON report of the representative run for the failing page and reads the audits that cost
   the points, such as a script that blocks rendering or an image without a text alternative. It fixes them and
   pushes, and the job runs again.

## Why

A page can get slower, or lose the text a screen reader needs, while every test passes: unit tests do not load the
page in a browser, and browser tests check that a flow works, not how fast. The audit loads each page the same way
every time and scores it, and its report names the audits that lost the points, so the agent knows what to fix.

## Set up

- **A config in the repository**: the pages, the number of runs and the assertions, such as `lighthouserc.json` for
  Lighthouse CI. Assertions at the `error` level block; those at `warn` only inform. The `lighthouse:recommended`
  preset asserts a perfect score on every audit outside performance, and a project starts from it and turns off
  what it does not need.
- **Judge the median.** Scores vary from run to run. Lighthouse CI's default aggregation, `optimistic`, takes the
  value most likely to pass from all runs, so one fast run hides a slow page; set `"aggregationMethod": "median"` on
  the performance assertions.
- **Size budgets as assertions**, such as `resource-summary:script:size` with a `maxNumericValue` in bytes:
  Lighthouse CI cannot combine a separate budget file with any other assertion.
- **The same conditions every time**: the same kind of runner, the same throttling, nothing else heavy running, and a
  preview of the same size. Without a preview, audit a production build started on the machine, never a development
  server, whose code is not optimised.
- **The check is tested** on static pages audited from a local directory (`staticDistDir`), which need no preview. A
  copy of a page with a large script that blocks rendering must fail on performance, and a copy with an image without
  `alt` must fail on accessibility, if it is asserted. The clean page must pass.
- **Out of the agent's reach.** The CI run is the one that counts, and it is a required check. A hook refuses the
  agent's writes to the audit's config, so a lower threshold goes through a person's review.

## Where it does not apply

The audit scores one page load under simulated conditions. It does not show how fast the app is on real users'
devices, or under the load of many users. Its accessibility score comes from automated rules: a person using
assistive technology meets more than the rules see.
