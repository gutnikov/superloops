---
title: HTTP client
summary: Sends a request to a service and shows exactly what came back.
sensors: [smoke-probe, manual-probe]
layer: project
vendors:
  - name: curl
    url: https://curl.se/
  - name: HTTPie
    url: https://httpie.io/
  - name: xh
    url: https://github.com/ducaale/xh
    note: HTTPie's syntax, in one binary
  - name: Hurl
    url: https://hurl.dev/
    note: requests and assertions on their answers, in a text file
  - name: grpcurl
    url: https://github.com/fullstorydev/grpcurl
    note: gRPC
---

An HTTP client sends one request to a service and shows what came back: the status, the headers and the body. It
works the same against a service in any stack.

## Finding it

- **On the machine**: curl is installed on most systems; `curl --version` confirms it.
- **The address and credentials**: the README, an example environment file (`.env.example`), the API's OpenAPI
  description.
- **Requests the project keeps**: `.http` files or a collection, which show the headers and the body a call needs.

## Using it

- **For a smoke and health probe**, let the exit code carry the result: `curl --fail -sS --max-time 10 <url>`.
  `--fail` turns an HTTP error into a non-zero exit code (`--fail-with-body` keeps the error's body), and `--max-time`
  makes a hung service fail the call instead of hanging it.
- **For a manual probe**, show everything that came back: `curl -sS -w '\n%{http_code}\n' <url>` prints the status
  code after the body; `-i` adds the headers, `-v` the request too. Keep the command with the value it showed.
- **Read tokens from the environment** (`-H "Authorization: Bearer $TOKEN"`) rather than typing them into the
  command: a token typed there stays in the shell history and the logs.
