---
title: Feedback channel
summary: "The ways users tell the team what works and what does not: an in-product feedback command, a form, the support desk, experiment results."
sensors: [user-feedback]
layer: system
vendors:
  - name: Zendesk
    url: https://www.zendesk.com/
    note: a support desk
  - name: Intercom
    url: https://www.intercom.com/
    note: a support desk, with messages in the product
  - name: PostHog
    url: https://posthog.com/
    note: surveys in the product, and experiments
  - name: GrowthBook
    url: https://www.growthbook.io/
    note: an experiment platform, open source
  - name: Optimizely
    url: https://www.optimizely.com/
    note: an experiment platform
---

Which channels exist depends on the product. Look for them in the product and in its team's tools rather than assume
them.

## Finding it

- **In the product**: a feedback command or button, a form, and where each sends what users write.
- **The support desk**: its export or its API.
- **The experiment platform**: the experiments that ran, and their results.

Access usually needs a person to grant it: these hold users' own words, and sometimes their data. Ask the person who
owns the channel, and read only what they grant. When a channel is missing, or has no export or API, report that
rather than work around it: adding a channel is the team's decision.

## Using it

- **Read in aggregate** over a window, grouped by topic, with counts and the channel each item came through.
- **Tie each item to the version** or the feature flag the user had, where the channel records it.
- **Strip personal data** before an item leaves the tool.
- **Read an experiment's results** only after it has run its planned length.
