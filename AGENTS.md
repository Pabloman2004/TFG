# AGENTS.md

## Cursor Cloud specific instructions

`stopp-start-app` is a single client-side Angular 20 SPA (clinical STOPP/START decision-support tool, Spanish UI). There is **no backend, database, or external service** — all state is persisted in the browser's `localStorage` and the only data fetch is the bundled static asset `src/assets/data/criteria.json`. Package manager is **npm** (`package-lock.json`).

Standard scripts live in `package.json` (`start`, `build`, `watch`, `test`); the run command for the app is `npm start` (`ng serve`, dev config, http://localhost:4200).

Non-obvious caveats:
- **Running unit tests headlessly:** `npm test` (`ng test`) defaults to a watch + headed-Chrome run and will hang/fail in this headless VM. Run them with `npx ng test --watch=false --browsers=ChromeHeadless` instead. Chrome is already installed; if Karma cannot locate it, prefix with `CHROME_BIN=$(which google-chrome)`.
- **No lint step exists** — there is no `ng lint`/ESLint config. Only Prettier formatting is configured (run `npx prettier --check .` / `--write`).
- `npm run build` defaults to the **production** configuration and may emit a non-fatal `anyComponentStyle` budget warning for `diagnosis-step.component.css` (~15kB); this is expected and not an error.
- Optional utility scripts (not services): `node scripts/audit-criteria.cjs`, `node scripts/verify-pdf-e2e.js` (its `pdf-parse` dep is optional), and `./scripts/check-links.sh` (docs `@linked` consistency check, must exit 0).
