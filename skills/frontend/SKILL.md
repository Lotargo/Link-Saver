---
name: frontend
description: Use for plain JavaScript frontend work, API communication, state management, DOM rendering, user interaction, styling, and frontend tests.
---

# Frontend Skill

## When to use

Read this file before changing the browser interface, frontend JavaScript, HTML, CSS, API integration, or frontend tests.

## Architecture rules

Keep these responsibilities distinguishable:

- API communication;
- application state;
- DOM rendering;
- event handling;
- user-facing error formatting.

A small implementation may keep several responsibilities in one file, but they must remain separate functions or clearly separated sections. Do not place all behaviour inside one event listener.

Use plain HTML, CSS, and JavaScript. Do not add React, a bundler, or a component framework for this task.

## Required interface behaviour

The interface must provide:

- a labelled URL input;
- a save action;
- a loading state while a link is being saved;
- a list of saved links;
- the fetched title, URL, and saved timestamp;
- a delete action for each link;
- a clear empty state;
- a visible error state;
- a favourite action once Phase 4 begins;
- a favourites-only filter once Phase 4 begins.

Do not add unrelated controls, modal windows, animations, accounts, themes, tags, search, or pagination.

## Interaction rules

- Clear stale errors before a new request.
- Prevent accidental repeated submission while saving.
- Restore controls after success or failure.
- Do not leave the interface in a permanent loading state.
- Do not optimistically remove or update persisted data unless failure recovery exists.
- Keep the visible list consistent with the server response.
- Confirm that deleting one item does not remove another item from local state.
- Keep the favourite filter predictable after create, update, and delete operations.

## HTML and accessibility

- Use semantic HTML.
- Associate labels with form controls.
- Use actual buttons for actions.
- Keep keyboard interaction available without custom scripting.
- Provide meaningful accessible names for icon-like actions.
- Do not rely only on colour to communicate favourite state or errors.
- Preserve visible focus behaviour.

## Rendering and safety

- Prefer DOM text APIs for external titles and URLs.
- Do not inject fetched titles with unsafe HTML.
- Format timestamps for display without changing the stored ISO value.
- Render long titles and URLs without breaking the page layout.
- Show concise messages intended for users, not raw server exceptions.

## Styling rules

- Keep styling small and readable.
- Prioritise layout, legibility, spacing, and usable states over visual polish.
- Support narrow and desktop widths without a separate design system.
- Make disabled, loading, favourite, empty, and error states visually understandable.

## Test rules

Every core frontend function and important state transition must have tests. Extract pure functions where practical so they can be tested without a browser. Add a DOM test environment only when it provides meaningful coverage rather than ceremony.

At minimum cover:

- conversion of API data into renderable state;
- safe title and URL rendering behaviour where practical;
- timestamp formatting;
- deletion of exactly one item from local state;
- user-facing API error formatting;
- favourite state updates;
- favourites-only filtering;
- loading-state reset after failure.

Prefer behavioural assertions over large snapshots.

## Completion checklist

Before marking frontend work complete:

1. Run the relevant tests.
2. Run linting.
3. Open the application in a browser.
4. Verify normal save and delete behaviour.
5. Verify one invalid URL or server failure path.
6. Check the layout at narrow and desktop widths.
7. Update `TODO.md` only after verification.
