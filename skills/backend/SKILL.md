---
name: backend
description: Use for Node.js and Express backend work, API routes, URL validation, remote title fetching, JSON persistence, and backend tests.
---

# Backend Skill

## When to use

Read this file before changing backend code, persistence, API behaviour, URL handling, title extraction, or backend tests.

## Architecture rules

Keep these responsibilities separate:

- process bootstrap and server startup;
- Express application configuration;
- HTTP routes and response mapping;
- application or service behaviour;
- persistent storage;
- URL validation and remote title fetching.

Routes must not read or write the JSON file directly. Storage modules must not depend on Express request or response objects. Remote fetching must be isolated so it can be tested without live network access.

Use modular or package-oriented boundaries, but do not create interfaces, factories, or layers that add no practical clarity or testability.

## Data rules

A saved link should contain at least:

- a stable string `id`;
- the normalized or accepted `url`;
- the fetched `title`;
- an ISO 8601 `savedAt` value;
- a boolean favourite field once Phase 4 is implemented.

Do not use timestamps as identifiers. Do not mutate unrelated records when updating or deleting one item.

## Persistence rules

- Create the storage directory and initial file when they do not exist.
- Treat malformed persisted data as an explicit startup or storage error.
- Never silently replace malformed data with an empty array.
- Keep writes atomic where practical by writing a temporary file and renaming it.
- Resolve storage paths independently of the caller's current working directory.
- The implementation may assume one local process, but that limitation must be documented.

## URL and title rules

- Validate that input is a non-empty string.
- Parse URLs with the platform URL parser.
- Accept only HTTP and HTTPS.
- Use a finite timeout for remote requests.
- Check the HTTP response status before reading the body.
- Treat unsupported or clearly non-HTML responses sensibly.
- Extract the title with a parser or similarly robust method, not a fragile greedy regular expression.
- Trim and normalize whitespace in the title.
- Return a clear expected error when no usable title exists.
- Do not claim complete SSRF protection unless every redirect and resolved address is actually checked.

## Error handling

- Distinguish validation, not-found, remote-fetch, storage, and unexpected errors.
- Map expected errors to stable HTTP status codes and concise JSON messages.
- Do not expose stack traces, filesystem paths, or raw internal errors to the client.
- Unexpected asynchronous errors must reach the central error handler.

## Test rules

Every core function and externally visible backend behaviour must have tests. Trivial glue does not need an isolated test when it is already covered through a meaningful higher-level test.

At minimum cover:

- storage initialization and reload;
- malformed persisted data;
- saving a link;
- deleting exactly one selected link;
- preserving unrelated links during deletion;
- updating favourite state;
- filtering favourites;
- valid and invalid URL input;
- unsupported protocols;
- successful title extraction;
- missing titles;
- remote timeout and unsuccessful responses;
- unknown identifiers;
- expected error mapping.

A bug fix is incomplete until a regression test reproduces the former failure and passes with the fix.

Tests must not depend on external websites. Inject or mock remote fetching and use temporary storage locations.

## Completion checklist

Before marking backend work complete:

1. Run the relevant tests.
2. Run linting.
3. Start the application when integration behaviour changed.
4. Verify one normal request and one failure path manually.
5. Update `TODO.md` only after verification.
