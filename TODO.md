# TODO

## Current handoff

- Current phase: Complete.
- Last verified state: local and deployed applications passed user browser verification; delivery documents, video, review files, and deployment configuration are complete.
- Next action: none; the repository is ready for submission.
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

- [x] Add final installation and run instructions to `README.md`.
- [x] Document assumptions and deliberately omitted work.
- [x] Document stack choice and growth path.
- [x] Document the exact files changed for favourites.
- [x] Add the paragraph of questions that would have been asked before starting.
- [x] Save 2–3 actual key AI prompts without rewriting them after the fact.
- [x] Explain the repository-driven AI workflow in the prompt notes.
- [x] Run a clean `pnpm install`.
- [x] Run `pnpm test`.
- [x] Run `pnpm lint`.
- [x] Start the application from the documented instructions.
- [x] Verify persistence across restart.
- [x] Check that no secrets or runtime data are committed.
- [x] Review the commit history for coherent real work boundaries.
- [x] Record the three-minute walkthrough.

## Deployment: Vercel and Neon (added after the original plan)

- [x] Record the architecture change from JSON deployment persistence to Neon.
- [x] Add a Neon serverless storage implementation without an ORM.
- [x] Add `DATABASE_URL` configuration for local and Vercel environments.
- [x] Add the Vercel function entrypoint and static-asset routing.
- [x] Create the Vercel project as `link_saver` (normalised from `Link_Saver`).
- [x] Add `DATABASE_URL` to Vercel Production as a sensitive environment variable.
- [x] Fix the Vercel Node runtime incompatibility with ESM-only `htmlparser2`.
- [x] Deploy to Vercel and verify `GET /` and `GET /api/links` return 200.
- [x] Perform a user browser smoke test against the deployed application.

## Session notes

Add only information needed by the next session. Keep this section short.

- Phase 1 verification: `pnpm test`, `pnpm lint`, and a manual HTTP request to the running server passed on 2026-07-10.
- Phase 2 verification: `pnpm test` (10 passing), `pnpm lint`, and manual `GET /api/links` plus invalid `POST /api/links` checks passed on 2026-07-10.
- Phase 3 verification: `pnpm test` (14 passing), `pnpm lint`, and static checks for `/` and `/favicon.svg` passed on 2026-07-10. The user manually verified saving and viewing a link in the browser. The timestamp field regression (`createdAt` versus API field `savedAt`) was fixed with a frontend regression test.
- Phase 4 verification: `pnpm test` (22 passing), `pnpm lint`, and a local HTTP smoke test (`GET /api/links` = 200; invalid favourite `PATCH` = 400) passed on 2026-07-10. The user confirmed browser verification of favourites, layout, and the unavailable-title marker for `https://chatgpt.com/`.
- Phase 5 verification: `REVIEW.md` includes the supplied source material, prioritised findings, breaking states, corrected code, and deletion-regression confirmation. `pnpm test` (22 passing) and `pnpm lint` passed on 2026-07-10.
- Russian review: `REVIEW_RU.md` mirrors the Phase 5 review for Russian-speaking readers.
- Phase 6 preparation: `pnpm install --frozen-lockfile`, `pnpm test` (22 passing), and `pnpm lint` passed on 2026-07-10. The application started successfully and returned 200 for `/` and `/api/links` on a temporary local port. No runtime data or environment files are tracked. The user confirmed that links and favourite state persist after restarting the server. Delivery-document review and walkthrough recording remain pending; delivery documentation is intentionally uncommitted.
- Deployment preparation: the user provisioned Neon and configured a local `DATABASE_URL` on 2026-07-11. Vercel deployment requires moving persistence from the JSON file to Neon because the function filesystem is not persistent.
- Neon migration and deployment: added the Neon serverless store, local `.env` loading, Vercel entrypoint and routing, and isolated storage tests. `pnpm test` (25 passing) and `pnpm lint` passed on 2026-07-11. The Vercel project `link_saver` was created, `DATABASE_URL` was stored as a sensitive Production variable, and https://linksaver-gamma.vercel.app was deployed. HTTP checks for `/` and `/api/links` returned 200 after resolving the `htmlparser2` ESM runtime failure; browser verification was pending at this point.
- Deployment browser verification: the user confirmed saving, favourites, filtering, persistence after a local restart, and equivalent Vercel behaviour. An anonymous browser window confirmed shared data can be read and deleted; the deletion was then visible in the primary browser window. The walkthrough video link is recorded in `README.md`.
- Final verification: the user approved the delivery review on 2026-07-11. `pnpm test` (25 passing) and `pnpm lint` passed immediately before the final commit.
