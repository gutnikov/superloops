---
title: Test fixtures
summary: The test code that puts the app into the state a test or a probe starts from, such as a user with an unpaid invoice. It seeds the state through the project's testing API rather than the UI.
sensors: [browser-run, manual-probe, test-runner]
layer: project
vendors:
  - name: Playwright Test
    url: https://playwright.dev/docs/test-fixtures
    note: fixtures; JavaScript
  - name: pytest
    url: https://docs.pytest.org/en/stable/how-to/fixtures.html
    note: fixtures; Python
  - name: factory_bot
    url: https://github.com/thoughtbot/factory_bot
    note: Ruby
  - name: Factory Boy
    url: https://factoryboy.readthedocs.io/
    note: Python
  - name: Fishery
    url: https://github.com/thoughtbot/fishery
    note: TypeScript
  - name: Instancio
    url: https://www.instancio.org/
    note: Java
---

Most of a test is its precondition. In "a user sends an invoice and sees it marked as sent", creating the user and the
invoice is most of the code, and the check is a few lines. A fixture is that first part: it seeds a state, that is,
creates the data the state needs, and asserts nothing about the feature. The scenario, the test's own steps, checks
behaviour on that state and seeds nothing itself. A state written once as a fixture serves the browser tests (the
Browser run sensor), the integration tests (Test runner) and the agent's probes (Manual probe). A probe is a throwaway
script with which the agent finds out what the running app does.

In browser tests, fixtures have a close relative: page objects, classes that are the only way tests touch one page of
the UI, with a method for each user action and the locators kept inside. The fixture produces the state and the page
objects act on it. A browser test or a probe built on both holds no seeding and no locators of its own. A probe that
finds a defect becomes a browser test on the same fixture.

## Finding it

- **The fixtures**: where the test framework declares them, such as `test.extend` calls in Playwright, `conftest.py`
  files in pytest or a `factories` folder for a factory library, often one file per product area on a shared base.
  Read a fixture's body, not only its name: it shows how the state is seeded and what comes with it, such as a second
  user or a plan.
- **The testing API**: an internal API for tests that creates users and records directly. Its client sits in the
  tests; read the service's own code too, which often has methods the tests never used.
- **Seeding helpers and logging in**: beside the fixtures and the testing API's client, look for the wrappers around
  the API's calls, some of which wait until a new record is ready, and for the way fixtures log in, such as an API call
  or a stored browser session.
- **Contract checks**: the small tests that assert only the state a fixture promises (see Proving it). Find where the
  existing ones live and how they are marked to run on their own, such as a tag in Playwright or a marker in pytest.

Where the project's conventions differ from this card, follow the project's. When it has no fixtures yet, the first
test or probe that needs a state starts one file for its area.

## Using it

- **Reuse first.** Take a fixture that already produces the state; failing that, build on one by adding one thing;
  write one from scratch last.
- **Name it after the state it produces**: `userWithUnpaidInvoice`, `adminWithInvitedMember`, never `setupUser` or
  `createInvoice`.
- **At most three levels deep.** Each fixture adds one thing to the one it builds on, so a reader can still tell which
  fixture seeded what.
- **Seed through the testing API first**, and through the UI only when the test is about the flow that creates the
  state, or the state needs effects only the UI produces. Seeding by walking forms is slow and breaks with each
  redesign of a screen the test is not about. Before deciding the API cannot do something, read its code. In tests
  that run inside the app's process, a factory library creates the records directly and plays the same part.
- **A fresh user for each test**, logged in through the API or a stored session, not the login form, unless the test
  is about logging in.
- **Leave shared state alone.** A fixture never changes what tests running in parallel share, such as a user's role.
- **Wait for a response or a state**, never a fixed time.
- **Say what it promises**: a comment above the fixture names the state it produces, the tests that need it, why it is
  seeded this way, and what a test must know, such as whose session it leaves open.
- **States named in a specification are fixtures.** Where the feature's specification starts each example from a
  named state (`sellerWithProduct`) that adds one thing to its parent and notes its concrete values, those states
  follow the same rules, and each one becomes a fixture that produces those values.

## Proving it

A fixture that produces the wrong state fails in the body of the test that uses it, and the search starts in the wrong
file. So each fixture comes with a contract check: a small test that asserts the state the fixture promises and
nothing more, at most a navigation and one assertion. It seeds nothing and never retries.

- **Run it twice, without retries**: once alone and once beside another test in parallel (`--workers=1`, then
  `--workers=2` in Playwright). Red the first time means the fixture is wrong: fix the fixture, never the check.
- **Green alone, red in parallel** means tests share something: an identifier without a random part, state kept
  between tests, a race in logging in, a rate limit. Fix it in the fixture; a retry only hides it.
- **Declare a state the project cannot seed yet as a stub fixture.** The testing API may have no route for it, or only
  an outside party creates it. The stub fails at once with a message that says what is missing and what would unblock
  it. Tests that need it fail fast and the gap stays in view, where a skipped test or a missing fixture would hide it.
  Its contract check is marked as known to fail (`test.fixme` in Playwright, `xfail` in pytest) until the gap closes,
  and a probe that meets the stub reports its message instead of seeding around it.
