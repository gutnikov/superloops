---
title: Browser access for the agent
summary: Gives the agent itself a browser to act in, through the page's accessibility tree, with the console and network in view.
sensors: [browser-run, manual-probe, screenshot]
layer: agent
vendors:
  - name: Playwright MCP
    url: https://github.com/microsoft/playwright-mcp
    note: the page as its accessibility tree
  - name: Chrome DevTools MCP
    url: https://github.com/ChromeDevTools/chrome-devtools-mcp
    note: Chrome, with its console, network and performance traces
  - name: agent-browser
    url: https://github.com/vercel-labs/agent-browser
    note: a command line rather than an MCP server
---

Browser automation runs test scripts; this tool lets the agent open the app and look for itself, while it works and
before any test exists. The agent reads the page as its accessibility tree: each element with its role and name.

## Finding it

It is an MCP server: a program that gives the agent extra tools through the Model Context Protocol. It is set in the
agent's MCP configuration, either a project file shared with the team (`.mcp.json` in Claude Code, `.cursor/mcp.json`
in Cursor) or the user's own settings. The agent's list of connected servers (`/mcp` in Claude Code) shows whether it
is there and running.

When it is missing or fails to start, add or fix its entry with the command that starts the server, as the server's
own instructions give it (`npx @playwright/mcp@latest` for Playwright MCP), then restart the agent so it connects.

## Using it

- **Probe before writing a test** (Manual probe): open the app, take a snapshot of the accessibility tree, act on
  elements by role and name, and note what a test should check.
- **Walk a flow end to end** (Browser run), reading the console and the network on the way: script errors and failed
  requests come from the browser, not from a guess about the page.
- **Capture what has to be seen** (Screenshot and recording): a screenshot, or a recording where the server offers
  one, when a model or a person has to judge the result by looking at it.
- **Give each session its own browser profile**, so logins and caches left by earlier runs do not change what the
  agent sees.
