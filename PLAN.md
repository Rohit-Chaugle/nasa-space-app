# Plan and status

## Goal

Build a complete static submission for the Ghostflame challenge: an explainable ranking and scenario briefing tool for the 19 combustion investigations named in the brief, with tests, documentation, accessibility checks, and a static deployment path.

## Constraints

- No invented data, sources, scores, or PSI record links.
- No runtime API, account, database, or raw sensor data.
- No em dashes in project copy.
- Only the supplied design tokens and self-hosted fonts.
- All 19 records and all required routes must be present.
- The site must build from a clean clone with `npm run verify`.
- The deployment must work on GitHub Pages under `/ghostflame/`.

## Architecture

- Vite, React 18, TypeScript, and hash routing.
- Static data in `src/data/investigations.json`, validated by Zod at build time.
- Pure domain modules under `src/lib` for scoring, atmosphere, search, coverage, gaps, brief generation, fields, and export.
- One archive context for the Compare tray and Brief pins, persisted to local storage when available.
- Plain CSS with design tokens, print rules, and responsive layouts.
- No backend.

## Milestones

### 1. Foundation

- [x] Vite, TypeScript, ESLint, Prettier, and Vitest configuration.
- [x] Schema and 19-record dataset.
- [x] Design tokens, type scale, and self-hosted Latin font subsets.
- [x] App shell, header, footer, skip link, and error boundary.

### 2. Core pages

- [x] Home and flame comparison.
- [x] Atlas with URL-backed filters and table/card views.
- [x] Investigation detail pages.
- [x] Crew Fit with presets, live weights, share URL, and preset matrix.
- [x] Atmosphere Lab with chart, table alternative, and formulas.
- [x] Ask with rules parser, TF-IDF search, and reason lines.
- [x] Compare with a four-record limit.
- [x] Controls, Data, Brief, Earth, Gaps, Glossary, Method, and Judges.
- [x] 404 handling.

### 3. Data and evidence

- [x] Required Moon and spacesuit arithmetic.
- [x] Readiness coverage and missing-evidence views.
- [x] CSV, JSON, and Markdown data dictionary exports.
- [x] Deterministic Scenario Brief with numbered sources.
- [x] Build-time dataset validation.
- [x] Data and methods documentation.

### 4. Quality

- [x] Unit tests for scoring, atmosphere, search, gaps, coverage, brief, fields, and data integrity.
- [x] Component tests for filters, Compare limit, and weight re-normalization.
- [x] Route tests for all 16 route outcomes.
- [x] Feature tests for the flame, filters, ranking, weights, atmosphere, search, Compare limit, tour, downloads, and print.
- [x] Axe WCAG A and AA scans for the main routes.
- [x] Responsive overflow checks at 375, 768, 1280, and 1920 pixels.
- [x] Typecheck, lint, unit test, build, and Playwright passes.
- [x] README, DATA, METHODS, REFERENCES, DEMO, PLAN, and LICENSE.
- [x] Playwright Chromium installed and e2e run locally.
- [x] Lighthouse local preview: 100 across Performance, Accessibility, Best Practices, and SEO on the checked desktop routes and mobile Home.

### 5. Deploy

- [x] GitHub Pages workflow authored.
- [ ] Repository created and workflow run on GitHub.
- [ ] Pages enabled with GitHub Actions as the source.
- [ ] Deployed URL recorded in the submission reply.
- [ ] Lighthouse run against the deployed URL.

The only remaining items require a GitHub repository and Pages setting. The local build is complete.

## Risks and controls

| Risk | Control |
| --- | --- |
| Invented evidence | Every record is brief-derived; schemas and UI use `not stated in brief` |
| Misreading the gravity analog | Labels and notes call E-FIELD an analog everywhere it affects a score |
| Hidden scoring | Formulas, factor values, weights, and reason lines are visible |
| Static-host route failure | Hash routing keeps all routes under `index.html` |
| Missing inputs presented as zero | Readiness is shown as coverage, not a performance grade |
| Accessibility regressions | Axe, keyboard tour, table alternatives, and overflow checks in e2e |
| Deployment base path | Vite base is `/ghostflame/` under GitHub Actions; repo name is documented |
| Data drift | Zod validation runs before the production build |

## Current verification

- TypeScript build: pass.
- ESLint: pass.
- Vitest: 63 tests pass.
- Production build: pass.
- Playwright: 16 route tests, 10 feature tests, and 11 accessibility and responsive tests pass.
- Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO on Home, Crew Fit, Brief, and mobile Home during local preview checks.
- Production size: 119.15 kB JavaScript gzip and 7.28 kB CSS gzip.
- Critical font preloads: Newsreader regular, Newsreader italic, and Hanken Grotesk regular.

## Definition of done

The project is done when the deployed URL passes the same route and feature checks as the local build, and the submission reply includes that URL, the judging path, and the verification results.
