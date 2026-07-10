# Implementation Plan

## Goal

Build a small single-page Link Saver that:

- accepts a URL and saves it;
- fetches the page title automatically;
- displays the saved title and timestamp;
- lists persisted links after restart;
- deletes a selected link;
- marks links as favourites;
- filters the list to favourites only;
- behaves sensibly for invalid or unreachable URLs.

The result must remain easy to run, review, and explain within the take-home time limit.

## Deliberate boundaries

The first version will not include:

- authentication or multiple users;
- React or another frontend framework;
- TypeScript or a build pipeline;
- Docker;
- an ORM;
- pagination, tagging, search, or link previews;
- production-grade distributed locking;
- a claim of complete SSRF protection.

Omitted items should be acknowledged honestly in the final README.

## Initial technical decisions

- Runtime: Node.js.
- Server: Express.
- Frontend: plain HTML, CSS, and JavaScript.
- Package manager: pnpm.
- Persistence: Neon Serverless Postgres through `DATABASE_URL`; the existing JSON store remains available only as a local fallback when that variable is absent.
- Tests: Node.js built-in test runner, with extra test tooling only when it clearly improves coverage.
- IDs: stable string identifiers rather than timestamps.
- Dates: ISO 8601 strings in persistence and API responses.

## Target module boundaries

The exact filenames may change during implementation, but these responsibilities must remain separated:

```text
src/
├── backend/
│   ├── server.js          # process bootstrap
│   ├── app.js             # Express application setup
│   ├── routes/            # HTTP input and output
│   ├── services/          # application behaviour
│   ├── storage/           # JSON persistence
│   └── lib/               # URL validation and title fetching
└── frontend/
    ├── index.html
    ├── app.js
    └── styles.css

tests/
├── backend/
└── frontend/
```

Routes must not read or write the JSON file directly. Storage code must not depend on Express objects. Frontend API calls, state handling, rendering, and event wiring should remain distinguishable even if they share a small number of files.

## Planned API

Base functionality:

- `GET /api/links`
- `POST /api/links`
- `DELETE /api/links/:id`

Favourite feature, added only after the base tool works:

- `PATCH /api/links/:id/favourite`
- `GET /api/links?favourites=true`

The exact response shapes will be documented once implemented.

## Working assumptions

- Only `http:` and `https:` URLs are accepted.
- Duplicate URLs are allowed unless implementation evidence suggests a simpler, safer rule.
- A page without a usable title is not saved and returns a clear error, except when it explicitly blocks automatic retrieval (HTTP 401, 403, or 429). In that case the link is saved with its hostname and marked as having an unavailable title.
- The application is designed for one local user and one server process.
- Remote requests use a finite timeout and check the HTTP response status.
- Full SSRF defence is outside this time-boxed version and must be listed as a production improvement.
- User-facing errors remain concise and do not expose stack traces.

## Phases

### Phase 0: Preparation

Deliverables:

- repository README;
- `AGENTS.md`;
- `PLAN.md`;
- `TODO.md`;
- backend and frontend skills.

Expected commits:

- `docs: initialize link saver repository`
- `docs: define project workflow and skills`

### Phase 1: Project foundation

Deliverables:

- initialize the pnpm project;
- pin the package manager in `package.json`;
- add start, development, test, and lint scripts;
- configure `.gitignore`;
- create backend and frontend entry points;
- serve the initial page;
- establish the test layout.

Expected commit:

- `chore: initialize pnpm project`

### Phase 2: Core backend

Deliverables:

- initialize and load persistent storage;
- validate URLs;
- fetch remote HTML with a timeout;
- extract page titles safely;
- create, list, and delete links;
- return explicit errors and status codes;
- cover core functions and destructive regressions with tests.

Expected commit:

- `feat: implement persistent link management`

### Phase 3: Core frontend

Deliverables:

- submit a URL;
- render saved links and timestamps;
- delete one selected link;
- show loading, empty, and error states;
- keep important state and rendering behaviour testable.

Expected commit:

- `feat: add link saver interface`

### Phase 4: Favourite feature

This phase begins only after the base tool works.

Deliverables:

- persist favourite state;
- add the favourite API operation;
- add a favourite control to the interface;
- filter to favourites only;
- add regression tests;
- record the exact changed files for the final README.

Expected commit:

- `feat: add favourites and filtering`

### Phase 5: Existing-code review

Deliverables:

- create `REVIEW.md`;
- identify bugs by severity;
- explain what each bug breaks and on which input or state;
- provide corrected code;
- prioritise destructive and runtime failures over cosmetic issues.

Expected commit:

- `docs: complete existing code review`

### Phase 6: Delivery

Deliverables:

- finish the README with run instructions, assumptions, trade-offs, changed favourite files, and future improvements;
- preserve 2–3 actual key prompts without rewriting them after the fact;
- verify a clean install and all repository checks;
- inspect commit history;
- prepare the three-minute walkthrough.

Expected commit:

- `docs: prepare final submission`

## Change policy

A phase may be adjusted when implementation reveals a better choice, but the reason must be written here and the corresponding checklist updated before unrelated work continues.

## Recorded changes

- 2026-07-11: replace the deployment persistence layer with Neon Serverless Postgres. Vercel Functions do not provide a persistent writable filesystem, so retaining the JSON file for the deployed application would violate the persistence requirement. This keeps the application deployable while preserving the no-ORM boundary.
