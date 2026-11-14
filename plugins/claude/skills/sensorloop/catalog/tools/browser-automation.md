---
title: Browser automation
summary: "A library that drives a real browser from a script: it clicks, types and waits, and records screenshots, video and traces."
sensors: [browser-run, screenshot]
layer: project
vendors:
  - name: Playwright
    url: https://playwright.dev/
    note: JavaScript, Python, Java, .NET
  - name: Puppeteer
    url: https://pptr.dev/
    note: JavaScript
  - name: Cypress
    url: https://www.cypress.io/
    note: JavaScript
  - name: Selenium
    url: https://www.selenium.dev/
    note: Java, Python, C#, Ruby, JavaScript
  - name: WebdriverIO
    url: https://webdriver.io/
    note: JavaScript
---

Test scripts written with the library build the Browser run sensor; the screenshots, videos and traces it records
build the Screenshot and recording sensor. Look for the library the project already uses rather than assume one.

## Finding it

Look in the dev dependencies for the library and its config file (`playwright.config.ts` or `cypress.config.js`, for
example; Selenium keeps its setup in the test code). Then look in CI for the job that runs the browser tests: when two
libraries turn up, that job shows which one the project runs. The config says where the tests live, which browsers
run, and how the app is started for them.

When the project has no browser tests, add a library that supports the project's language, and start with one test of
the main user flow.

## Using it

- **Start the app from the test config** (Playwright's `webServer` setting, for example; elsewhere, a script that
  starts the app before the tests), so a local run and CI start it the same way and wait for it to answer.
- **Locate elements by role and name**: `getByRole('button', { name: 'Save' })` rather than a CSS path, so the test
  finds what a user and assistive technology would find.
- **Turn retries off to look for flakiness**, and run each test many times (`--retries=0 --repeat-each=10` in
  Playwright; a loop in the shell where the library has no repeat option).
- **Keep the evidence of each failed run**: a trace, a screenshot or a video, for a model or a person to look at.
- **Compare screenshots against approved images** (`toHaveScreenshot` in Playwright, a plugin in Cypress). An intended
  change updates the approved image in the same change, where a reviewer sees it.
