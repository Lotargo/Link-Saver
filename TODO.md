# TODO

## Current handoff

- Current phase: Phase 6, Delivery.
- Last verified state: Phase 5 review is complete; all automated checks pass.
- Next action: complete the README and delivery checklist.
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

- [x] Create the data directory and initial JSON file when absent.
- [x] Load persisted links after restart.
- [x] Reject malformed persisted data without silently overwriting it.
- [x] Keep file writes atomic where practical.
- [x] Keep storage independent from Express request and response objects.
- [x] Add tests for initialization, loading, saving, updating, and deleting.

### URL and title handling

- [x] Reject missing or non-string URLs.
- [x] Accept only HTTP and HTTPS.
- [x] Fetch remote pages with a finite timeout.
- [x] Check unsuccessful HTTP responses.
- [x] Extract titles without a fragile regular expression.
- [x] Handle pages without a usable title.
- [x] Add tests for valid URLs, invalid URLs, timeouts, response errors, and missing titles.

### API

- [x] Implement `GET /api/links`.
- [x] Implement `POST /api/links`.
- [x] Implement `DELETE /api/links/:id`.
- [x] Return a not-found response for unknown IDs.
- [x] Prevent deletion of unrelated links.
- [x] Map expected failures to clear status codes and messages.
- [x] Add API or service-level regression tests for core behaviour.

## Phase 3: Core frontend

- [x] Create the URL form.
- [x] Load saved links on startup.
- [x] Render titles, URLs, and saved timestamps.
- [x] Delete one selected link.
- [x] Show a useful empty state.
- [x] Show a loading state during submission.
- [x] Prevent accidental repeated submission.
- [x] Show user-facing errors without internal details.
- [x] Restore controls after failed requests.
- [x] Keep API, state, rendering, and event responsibilities distinguishable.
- [x] Add tests for core state and rendering behaviour.
- [x] Perform a manual browser smoke test.

## Phase 4: Favourite feature

- [x] Add a persisted favourite field with a safe default for existing records.
- [x] Add the favourite update operation.
- [x] Add the favourite control to each link.
- [x] Add the favourites-only filter.
- [x] Verify favourite state survives restart.
- [x] Add regression tests for update and filtering behaviour.
- [x] Record the exact changed files for the final README.
- [x] Save links from sites that explicitly block title retrieval and mark their titles as unavailable.

## Phase 5: Existing-code review

- [x] Create `REVIEW.md`.
- [x] Identify destructive data-loss bugs.
- [x] Identify runtime and startup failures.
- [x] Identify validation and network failures.
- [x] Identify title-extraction failures.
- [x] Identify persistence and path reliability issues.
- [x] Identify lower-severity API and cosmetic issues.
- [x] Rank each finding by severity.
- [x] Explain the breaking input or state for each finding.
- [x] Provide corrected code.
- [x] Confirm the correction does not reproduce the destructive deletion bug.

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
- Phase 2 verification: `pnpm test` (10 passing), `pnpm lint`, and manual `GET /api/links` plus invalid `POST /api/links` checks passed on 2026-07-10.
- Phase 3 verification: `pnpm test` (14 passing), `pnpm lint`, and static checks for `/` and `/favicon.svg` passed on 2026-07-10. The user manually verified saving and viewing a link in the browser. The timestamp field regression (`createdAt` versus API field `savedAt`) was fixed with a frontend regression test.
- Phase 4 verification: `pnpm test` (22 passing), `pnpm lint`, and a local HTTP smoke test (`GET /api/links` = 200; invalid favourite `PATCH` = 400) passed on 2026-07-10. The user confirmed browser verification of favourites, layout, and the unavailable-title marker for `https://chatgpt.com/`.
- Phase 5 verification: `REVIEW.md` includes the supplied source material, prioritised findings, breaking states, corrected code, and deletion-regression confirmation. `pnpm test` (22 passing) and `pnpm lint` passed on 2026-07-10.
- Russian review: `REVIEW_RU.md` mirrors the Phase 5 review for Russian-speaking readers.
