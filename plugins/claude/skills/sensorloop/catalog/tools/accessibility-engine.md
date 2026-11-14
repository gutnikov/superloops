---
title: Accessibility rules engine
summary: Applies accessibility rules (WCAG) to a rendered page, and names the element behind each violation.
sensors: [browser-run]
layer: project
vendors:
  - name: axe-core
    url: https://github.com/dequelabs/axe-core
    note: JavaScript in the page; the tests call it through `@axe-core/playwright`, `cypress-axe` or `axe-selenium-python`
  - name: Pa11y
    url: https://pa11y.org/
    note: a command line and a CI runner, over axe-core or HTML_CodeSniffer
  - name: IBM Equal Access Accessibility Checker
    url: https://github.com/IBMa/equal-access
    note: IBM's own rules, with a Node.js package for the tests
---

Most of the rules come from WCAG, the Web Content Accessibility Guidelines. An engine catches only what a rule can
express: it can tell that an image has no text alternative, not whether the text describes the image, and it cannot
tell whether the order of focus makes sense. A person using assistive technology meets more than the rules see.

## Finding it

Look in the dev dependencies for the engine itself or for the package that connects it to the project's browser
driver (`@axe-core/playwright`, for example), and in the browser tests for the call that runs it. Its settings (the
rule tags it applies, the rules or regions it leaves out) sit beside that call or in a shared test helper.

When the browser tests have no engine, add the engine's package for their driver. Without browser tests, a
command-line runner such as Pa11y opens the pages itself.

## Using it

- **Run it inside the browser tests**, on each page or state worth checking.
- **Apply the level the project commits to**, for example the `wcag2a` and `wcag2aa` tags, and keep every exclusion
  with its reason.
- **Keep the selector**: each violation comes back with its rule, its impact and a selector for the element; report
  all three.

A snapshot of the accessibility tree is a different check, made by the browser driver rather than the engine
(`toMatchAriaSnapshot` in Playwright). It applies no rules, but a role or name lost from a key page shows as a diff.
