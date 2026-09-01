# AGENTS.md

## Cursor Cloud specific instructions

This is a single Angular 20 SPA (`stopp-start-app`): a Spanish-language STOPP/START
clinical decision-support tool. Selecting medications and diagnoses evaluates
prescribing criteria (rules in `src/assets/data/criteria.json`, evaluated via
`json-logic-js` in `src/app/core/services/criteria-engine.service.ts`). There is no
backend — all logic runs in the browser and state persists to `localStorage`.

Standard commands live in `package.json` scripts and `angular.json`. The update
script already runs `npm install`, so dependencies are present at session start.

- Run dev server: `npx ng serve` (defaults to the `development` config; bind with
  `--host 127.0.0.1 --port 4200` when verifying). Do not use `ng build` (production)
  for development.
- Unit tests (Karma + Jasmine): `npx ng test --watch=false --browsers=ChromeHeadless`.
 Headless Chrome is preinstalled at `/usr/bin/google-chrome-stable` and works without
 extra flags. The full suite (989 specs) passes; the `❌ Error evaluando criterio`
 console lines during the run are emitted by an intentional error-handling spec, not a
 failure — trust the final `TOTAL: ... SUCCESS` line.
- Dev build: `npx ng build --configuration development`.
- There is no `lint` npm script and no ESLint config. The repo-specific consistency
  check is `bash scripts/check-links.sh` (validates the `@linked` docs pattern; must
  exit 0). Type checking happens as part of `ng build`.
- `TASKS.md` / `CLAUDE.md` describe a strict TDD + Linked-Chunks workflow; when editing
  a file, check its `// @linked` doc references and keep `scripts/check-links.sh` green.
