# Link Saver

A small single-page application for saving links, fetching page titles automatically, deleting saved links, and marking favourites.

This repository is being built as a time-boxed take-home task. The implementation is intentionally small, testable, and easy to run.

## Planned stack

- Node.js
- Express
- Plain HTML, CSS, and JavaScript
- JSON file persistence
- pnpm
- Node.js built-in test runner

The stack is provisional until the foundation phase is completed. Any change must be recorded in `PLAN.md` and `TODO.md`.

## Project workflow

The repository keeps durable project context in files instead of repeating the same instructions in every AI prompt:

- [`AGENTS.md`](./AGENTS.md) contains repository-wide rules.
- [`PLAN.md`](./PLAN.md) defines implementation phases and boundaries.
- [`TODO.md`](./TODO.md) records progress and session handoff state.
- [`skills/backend/SKILL.md`](./skills/backend/SKILL.md) contains backend-specific instructions.
- [`skills/frontend/SKILL.md`](./skills/frontend/SKILL.md) contains frontend-specific instructions.

Actual key prompts used during implementation will be added later without rewriting them after the fact.

## Status

The planning and instruction layer is complete. Application code has not been implemented yet. The next step is Phase 1 in `PLAN.md`.
