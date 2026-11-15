# Ghostflame

Ghostflame is Team Targaryen's NASA Space Apps Challenge entry. It is a static, browser-only tool for a fire-safety engineer who needs to answer three questions about a crew environment:

1. Which combustion investigations should I trust?
2. Why does the ranking put them in that order?
3. What data can I pull out for modeling, and what is missing?

The site ranks the 19 investigations named in the challenge brief. Seventeen have a PSI record. LUCI and FM2 are planned and are never scored.

## Quick start

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To check the production build:

```bash
npm run build
npm run preview
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Typecheck and build the production site into `dist` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest in watch mode |
| `npm run test -- --run` | Run the unit and component test suite once |
| `npm run e2e` | Run the Playwright route, feature, and accessibility suite |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript in build mode without emitting |
| `npm run verify` | Run typecheck, lint, unit tests, build, and e2e |

Playwright needs a local Chromium install:

```bash
npx playwright install chromium
```

## Routes

The app uses hash routing so every page works on a static host.

| Route | What it does |
| --- | --- |
| `#/` | Home, flame comparison, and the entry points |
| `#/atlas` | Filterable table and card view of all 17 in-PSI records |
| `#/investigations/:id` | Full record sheet with readiness, sources, and actions |
| `#/crew-fit` | Weighted ranking with presets, live weights, and a share URL |
| `#/atmosphere` | Oxygen partial-pressure lab and chart |
| `#/ask` | Rules parser plus TF-IDF search with reason lines |
| `#/compare` | Two to four records compared field by field |
| `#/controls` | Four fire-safety control questions tied to named records |
| `#/data` | Data dictionary, record selection, CSV and JSON export |
| `#/brief` | Scenario Brief with sources, Markdown copy, and print view |
| `#/earth` | The same fire problem translated to Earth |
| `#/gaps` | Missing evidence and planned records |
| `#/glossary` | Plain-language terms |
| `#/method` | Scoring, search, data, and source rules |
| `#/judges` | Three-minute review path mapped to the judging criteria |
| any other path | A 404 page inside the site |

## Ranking model

Crew Fit scores each in-PSI record from 0 to 100:

```text
score = 100 * sum(weight_i * factor_i)
```

The five factors are function, oxygen, gravity, tier, and readiness. Weights are normalized to 100%. The presets are Spacecraft cabin, Space station, Lunar base, Martian base, and Pressurized rover. With the Lunar base preset and default weights, CFI-G ranks first and E-FIELD ranks second.

The gravity factor deliberately treats the E-FIELD partial-gravity analog as a match for surface presets. The interface says it is an analog, not partial-gravity data. Full rules and default weights are in [METHODS.md](METHODS.md) and on `#/method`.

## Atmosphere model

Oxygen partial pressure is oxygen fraction times total pressure. The site uses three planning points:

| Point | Oxygen | Total pressure | Oxygen partial pressure |
| --- | --- | --- | --- |
| Earth sea level | 21% | 14.7 psi | 3.09 psi |
| Moon planning point | 30% | 10.2 psi | 3.06 psi |
| Spacesuit | 100% | 4.3 psi | 4.30 psi |

At the Moon planning point, the partial-pressure change against Earth is -1% and the oxygen-fraction change is +43%. The spacesuit is +39% against Earth. The 21% value is a standard atmosphere value, not a value from the brief.

## Data and integrity

- Every record in `src/data/investigations.json` is validated by Zod at build time.
- All 19 records came from the challenge brief.
- Every verification field is `named_in_brief`.
- Every PSI URL is the archive home page, `https://psi.nasa.gov/`.
- No raw sensor data is hosted or fetched.
- Unknown fields say `not stated in brief` instead of inventing a value.
- The build is static. No API key, account, database, or runtime request is required.

See [DATA.md](DATA.md) and [REFERENCES.md](REFERENCES.md) for the record table, field limits, and source notes.

## Accessibility and performance

- Semantic landmarks, skip link, visible focus, and a keyboard-trapped guided tour.
- Charts have text alternatives and table views.
- Reports use print styles and keep source notes on the page.
- Axe runs against the main routes in the Playwright suite.
- Fonts are self-hosted Latin subsets. There are no third-party scripts.

## Verification results

Local production preview, July 2026:

- TypeScript: pass.
- ESLint: pass.
- Vitest: 63 tests pass.
- Playwright: 37 tests pass, covering all routes, the guided tour, downloads, print, Compare limit, keyboard-critical flows, Axe WCAG A and AA scans, and four viewport widths.
- Lighthouse desktop on Home, Crew Fit, and Brief: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- Lighthouse mobile on Home: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO. LCP was 0.8 s and CLS was 0.001 on the local preview.
- Production JavaScript: 119.15 kB gzip. Production CSS: 7.28 kB gzip.
- Critical Latin fonts are preloaded. All fonts are self-hosted.

These are local measurements. A deployed URL should be rechecked after Pages is enabled.

## Deployment

The workflow at `.github/workflows/deploy.yml` runs `npm run verify`, builds the site, and deploys `dist` to GitHub Pages.

The Vite configuration uses the base path `/ghostflame/` when `GITHUB_ACTIONS` is set. The repository must therefore be named `ghostflame`, or the base path must be changed in `vite.config.ts`. Enable Pages with GitHub Actions as the source. The public URL will be shown in the repository's Pages settings after the first successful deployment.

## Limitations

- The archive is a brief-derived metadata set, not a live PSI query.
- No partial-gravity combustion record is present. E-FIELD is an analog.
- Readiness is coverage of six stated inputs, not a laboratory quality grade.
- Crew Fit weights are planning choices, not measured physical constants.
- The search parser only recognizes the synonym table in `src/lib/search.ts`.
- There is no backend, user account, upload, or server-side logging.

## License

MIT. See [LICENSE](LICENSE).
