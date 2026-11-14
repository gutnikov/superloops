---
title: Component workshop
summary: A place apart from the app where each of the project's components and screens renders alone, at its own local address, with no backend and no login.
sensors: [human-review, screenshot, browser-run]
layer: project
vendors:
  - name: Storybook
    url: https://storybook.js.org/
    note: React, Vue, Angular, Svelte and others
  - name: Ladle
    url: https://ladle.dev/
    note: React
  - name: Histoire
    url: https://histoire.dev/
    note: Vue, Svelte
  - name: Lookbook
    url: https://lookbook.build/
    note: Ruby on Rails
  - name: Widgetbook
    url: https://www.widgetbook.io/
    note: Flutter
---

A workshop shows the interface without the rest of the app: no backend, no login, no data to seed. The design system
is the project's own set of components, layout parts and tokens: its colours, spacing and type. The workshop renders
them as the app would, inside the app's global styles and providers, the wrappers that give every screen the app's
theme, translations and other shared settings. Each state of a component is a story, Storybook's word, rendered alone
at its own address. On stories, three sensors are cheap to build: a Human review of a screen before the feature is
built, a Screenshot and recording of one component at a time, and a Browser run that checks each story.

## Finding it

- **A workshop already set up**: its config folder (`.storybook/`, `.ladle/`), story files beside the components
  (`*.stories.tsx`, `*.story.vue`), and the script in the task file that starts it.
- **Another place that shows components apart from the app**: a scratchpad route in the app, or a separate demo app.
- **The design system**: a package in the workspace, a components folder or a library among the dependencies. Each
  component's props are in its source.
- **What a screen needs around it**: the global stylesheet, and the providers the app wraps itself in.
- **CI**: a job that builds the workshop or runs its stories as tests.

Where the project already has a way to show components, use that one. Setting up a workshop where there is none is a
decision for a person: it adds dependencies, files and a command the team carries.

## Using it

- **Data that breaks layouts**: long names, large numbers, missing fields and an empty state, not three tidy rows.
  Shared fake data sits in one file, so every story, and every sensor built on it, meets the same awkward cases.
- **Screenshot and recording, one story at a time**: a browser driver opens a story's address, waits for it to settle
  and takes a screenshot. The driver compares the screenshot with the story's approved image, so a difference names
  the component that changed. An interaction on a story can be recorded as a video for a person to watch.
- **Browser run on each story**: the same driver runs a short interaction on a story (open the menu, type in the
  field) and checks what appears. An accessibility engine runs on each story, so every state that has a story is
  checked. Storybook's accessibility addon runs axe-core on each story; with another workshop, the browser tests run
  the engine on each story's address.
- **Prototypes**: a prototype is a screen composed from the design system to show an idea before the feature is
  built. It imports only the design system, makes no API calls and never ships; a check that refuses any other import
  keeps it from growing into the feature.
- **Human review of a prototype**: before a person sees it, the agent opens it in a browser and fixes what the console
  shows. The person then looks at it, at its address or in a screenshot, and their answer decides what to build.
