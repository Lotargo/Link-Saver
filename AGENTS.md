# AGENTS.md

## Purpose

Build the Link Saver take-home task as a small, reliable, and explainable application. Prefer a complete, tested implementation over extra features or architectural ceremony.

## Sources of truth

Use this order when instructions conflict:

1. The candidate brief.
2. `PLAN.md` for project decisions and phase boundaries.
3. `TODO.md` for current progress and session handoff state.
4. The relevant file under `skills/` for implementation rules.
5. Existing code and tests.

Do not silently change an accepted decision. Record the change in `PLAN.md` and update `TODO.md`.

## Starting or resuming a session

Before editing files:

1. Read `AGENTS.md`.
2. Read `PLAN.md`.
3. Read `TODO.md`.
4. Inspect the current Git status and recent commits.
5. Read the skill relevant to the first incomplete task:
   - backend work: `skills/backend/SKILL.md`
   - frontend work: `skills/frontend/SKILL.md`
6. Continue from the first unchecked item in the current phase.

Do not assume that unchecked work is complete. Do not repeat completed work unless verification shows that it is broken.

## Required workflow

For each coherent batch of related tasks:

1. Identify the smallest complete result to implement next.
2. Inspect the surrounding code before editing it.
3. Keep responsibilities separated by module or package boundary.
4. Add or update tests for every core function and important behaviour.
5. Run the relevant checks.
6. Fix failures before moving on.
7. Update `TODO.md` only after the work is verified.
8. Commit the completed batch before starting unrelated work.

A commit may cover several adjacent TODO items when they form one logical result. Do not mark work complete merely because code was written.

## Repository-wide constraints

- Use JavaScript and Node.js.
- Use pnpm as the only package manager.
- Keep `pnpm-lock.yaml` committed.
- Do not introduce React, TypeScript, Docker, an ORM, or an external database unless `PLAN.md` is explicitly changed first.
- Do not add features that are absent from the brief.
- Prefer small modules with explicit responsibilities over a single large file.
- Avoid abstractions that have only one trivial use and do not improve testability or clarity.
- Validate all external input.
- Handle expected failures explicitly.
- Do not expose stack traces or internal implementation details to the browser.
- Do not commit secrets, API keys, local runtime data, or generated temporary files.
- Preserve existing public behaviour unless the task explicitly changes it.
- A bug fix is incomplete until a regression test demonstrates the intended behaviour.

## Verification

After the project foundation exists, use the repository scripts rather than ad hoc commands:

```bash
pnpm test
pnpm lint
```

After backend or integration changes, also start the application and perform a short HTTP smoke test.

Do not run or automate browser checks through Codex. Give the user the start command or leave the local server running, then let the user perform browser verification. Record the user's reported result in `TODO.md`; if it is still pending, do not mark the browser smoke-test item complete.

If a required command cannot run, record the reason in `TODO.md` instead of pretending verification succeeded.

## Session handoff

Before ending a session:

- update the current phase and next action in `TODO.md`;
- record unresolved issues or blocked decisions;
- leave completed items checked only when verified;
- leave the repository in a runnable state when application code exists;
- make sure the latest commit represents a coherent state.

## Commit guidance

Commit completed, related work rather than every task or file. Before committing, review the diff, run the relevant checks, and update `TODO.md`.

Use a concise conventional-style subject. In the commit body, briefly state what was implemented and include the results of checks when applicable.

Do not commit partial or failing work to `main`, mix unrelated changes, or manufacture artificial history after the work is finished.
