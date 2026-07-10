# TODO

## Current handoff

- Current phase: Phase 2, Core backend.
- Last verified state: the pnpm-based Express foundation serves the initial frontend page; tests, linting, and a manual HTTP smoke test pass.
- Next action: implement JSON persistence, beginning with storage initialization and malformed-data handling.
- Blockers: none.

## Phase 0: Preparation

- [x] Review the candidate brief.
- [x] Record the initial technical decisions.
- [x] Define deliberate scope boundaries.
- [x] Create `README.md`.
- [x] Create `AGENTS.md`.
- [x] Create `PLAN.md`.
- [x] Create `TODO.md`.
- [x] Create `skills/backend/SKILL.md`.
- [x] Create `skills/frontend/SKILL.md`.

## Phase 1: Project foundation

- [x] Enable and use pnpm.
- [x] Create `package.json`.
- [x] Pin the pnpm version with the `packageManager` field.
- [x] Commit `pnpm-lock.yaml`.
- [x] Add `start`, `dev`, `test`, and `lint` scripts.
- [x] Add only the dependencies required by the chosen implementation.
- [x] Create `.gitignore`.
- [x] Create backend and frontend entry points.
- [x] Serve the initial frontend page.
- [x] Establish backend and frontend test locations.
- [x] Run the initial test and lint commands.
- [x] Perform a manual startup smoke test.

## Phase 2: Core backend

### Persistence

- [ ] Create the data directory and initial JSON file when absent.
- [ ] Load persisted links after restart.
- [ ] Reject malformed persisted data without silently overwriting it.
- [ ] Keep file writes atomic where practical.
- [ ] Keep storage independent from Express request and response objects.
- [ ] Add tests for initialization, loading, saving, updating, and deleting.

### URL and title handling

- [ ] Reject missing or non-string URLs.
- [ ] Accept only HTTP and HTTPS.
- [ ] Fetch remote pages with a finite timeout.
- [ ] Check unsuccessful HTTP responses.
- [ ] Extract titles without a fragile regular expression.
- [ ] Handle pages without a usable title.
- [ ] Add tests for valid URLs, invalid URLs, timeouts, response errors, and missing titles.

### API

- [ ] Implement `GET /api/links`.
- [ ] Implement `POST /api/links`.
- [ ] Implement `DELETE /api/links/:id`.
- [ ] Return a not-found response for unknown IDs.
- [ ] Prevent deletion of unrelated links.
- [ ] Map expected failures to clear status codes and messages.
- [ ] Add API or service-level regression tests for core behaviour.

## Phase 3: Core frontend

- [ ] Create the URL form.
- [ ] Load saved links on startup.
- [ ] Render titles, URLs, and saved timestamps.
- [ ] Delete one selected link.
- [ ] Show a useful empty state.
- [ ] Show a loading state during submission.
- [ ] Prevent accidental repeated submission.
- [ ] Show user-facing errors without internal details.
- [ ] Restore controls after failed requests.
- [ ] Keep API, state, rendering, and event responsibilities distinguishable.
- [ ] Add tests for core state and rendering behaviour.
- [ ] Perform a manual browser smoke test.

## Phase 4: Favourite feature

- [ ] Add a persisted favourite field with a safe default for existing records.
- [ ] Add the favourite update operation.
- [ ] Add the favourite control to each link.
- [ ] Add the favourites-only filter.
- [ ] Verify favourite state survives restart.
- [ ] Add regression tests for update and filtering behaviour.
- [ ] Record the exact changed files for the final README.

## Phase 5: Existing-code review

- [ ] Create `REVIEW.md`.
- [ ] Identify destructive data-loss bugs.
- [ ] Identify runtime and startup failures.
- [ ] Identify validation and network failures.
- [ ] Identify title-extraction failures.
- [ ] Identify persistence and path reliability issues.
- [ ] Identify lower-severity API and cosmetic issues.
- [ ] Rank each finding by severity.
- [ ] Explain the breaking input or state for each finding.
- [ ] Provide corrected code.
- [ ] Confirm the correction does not reproduce the destructive deletion bug.

## Phase 6: Delivery

- [ ] Add final installation and run instructions to `README.md`.
- [ ] Document assumptions and deliberately omitted work.
- [ ] Document stack choice and growth path.
- [ ] Document the exact files changed for favourites.
- [ ] Add the paragraph of questions that would have been asked before starting.
- [ ] Save 2–3 actual key AI prompts without rewriting them after the fact.
- [ ] Explain the repository-driven AI workflow in the prompt notes.
- [ ] Run a clean `pnpm install`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm lint`.
- [ ] Start the application from the documented instructions.
- [ ] Verify persistence across restart.
- [ ] Check that no secrets or runtime data are committed.
- [ ] Review the commit history for coherent real work boundaries.
- [ ] Record the three-minute walkthrough.

## Session notes

Add only information needed by the next session. Keep this section short.

- Phase 1 verification: `pnpm test`, `pnpm lint`, and a manual HTTP request to the running server passed on 2026-07-10.
