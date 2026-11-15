# Methods

## Design rule

The site shows the calculation that produced an answer. A number appears only when it comes from the brief, a fixed standard value named on the page, or arithmetic on those values. Missing evidence is a finding, not a value to fill in.

## Crew Fit

### Score

For each in-PSI record `r` and environment preset `p`:

```text
score(r, p) = 100 * sum over five factors of (weight_i * factor_i(r, p))
```

Weights are non-negative and normalized so they sum to 1. If every weight is zero, the site falls back to five equal weights of 0.2.

### Factors

| Factor | Rule |
| --- | --- |
| Function | 1 if the record has a primary function for the preset, 0.5 if it has a secondary function, otherwise 0 |
| Oxygen | 1 if the stated `oxygen_pct_max` is 30 or more, 0.5 if it is below 30, 0.5 if oxygen is stated without a numeric maximum, 0.2 if not stated |
| Gravity | 1 for an exact match, 1 for the partial-gravity analog against a partial-gravity preset, 0.5 for microgravity against a partial-gravity preset, 0.5 for the analog against a microgravity preset, otherwise 0 |
| Tier | 1 for direct, 0.4 for related, 0 for planned |
| Readiness | Number of stated readiness inputs divided by 6 |

The gravity analog is E-FIELD. It uses an electric field to create an effective partial-gravity condition. It is not partial-gravity combustion data. The interface labels this distinction wherever the score is explained.

### Presets and default weights

| Preset | Gravity | Function | Oxygen | Gravity | Tier | Readiness |
| --- | --- | --- | --- | --- | --- | --- |
| Spacecraft cabin | microgravity | 0.30 | 0.10 | 0.25 | 0.20 | 0.15 |
| Space station | microgravity | 0.25 | 0.10 | 0.20 | 0.25 | 0.20 |
| Lunar base | partial | 0.25 | 0.25 | 0.20 | 0.15 | 0.15 |
| Martian base | partial | 0.25 | 0.15 | 0.25 | 0.15 | 0.20 |
| Pressurized rover | partial | 0.25 | 0.25 | 0.15 | 0.15 | 0.20 |

Primary and secondary functions are defined in `src/lib/scoring.ts`. For example, the Lunar base primary functions are oxygen-enriched, partial-gravity, and flammability. Its secondary functions are suppression and detection.

### Ordering

Records are sorted by score, highest first. Ties break on the readiness count, highest first, then on name in ascending alphabetical order.

### URL state

The preset and weights are encoded in the query string. A shared URL reproduces the same order because all inputs travel in the URL and the scoring is deterministic.

## Scenario Brief

The Brief uses the same five factors and then adds a focus:

- A focus function is appended to the preset primary functions.
- The function weight increases by 0.15.
- All weights are normalized again.
- The top five in-PSI records are shown.
- Each record carries a reason line and source keys.
- Missing fields and data needs are listed explicitly.

The brief is generated in the browser from the same dataset. Print CSS removes form controls and keeps the report and its numbered sources.

## Atmosphere Lab

The identity is:

```text
oxygen partial pressure = (oxygen fraction / 100) * total pressure
```

The reference values are:

| Point | Oxygen | Pressure | Partial pressure |
| --- | --- | --- | --- |
| Earth sea level | 21% | 14.7 psi | 3.09 psi |
| Moon planning point | 30% | 10.2 psi | 3.06 psi |
| Spacesuit | 100% | 4.3 psi | 4.30 psi |

Percent change is:

```text
percent change = ((value - baseline) / baseline) * 100
```

Against Earth:

- Moon partial pressure: 3.06 against 3.09, which rounds to -1%.
- Moon oxygen fraction: 30 against 21, which rounds to +43%.
- Spacesuit partial pressure: 4.30 against 3.09, which rounds to +39%.

The brief states 14.7 psi, the Moon planning point, and 100% oxygen at 4.3 psi. The 21% Earth oxygen fraction is a standard atmosphere value, and the site says so. Partial pressure and oxygen fraction can move in opposite directions. The site does not claim that flammability follows one measure rather than the other.

## Search

The Ask page uses two layers:

1. A fixed synonym table turns phrases into removable concepts: liquid, solid, gas, detection, dust detection, suppression, partial gravity, oxygen above 30%, and microgravity.
2. The remaining text is tokenized with light stemming and stopword removal. Each record is ranked by TF-IDF cosine similarity.

Records that match a rule concept rank before records that only have text similarity. Rule matches are ordered by the number of matched concepts, then similarity. Planned records are shown separately and never scored. The reason line states the concepts and terms that caused the result.

The synonym table is intentionally small and visible in `src/lib/search.ts`. The parser does not use a remote language model.

## Data integrity

- Zod validates `investigations.json` before the production build.
- The 19 IDs are fixed in `src/data/schema.ts`.
- Record objectives are limited to 35 words by the schema.
- Readiness fields must state whether they are stated and must have a value.
- Unknown numerical values are null or explicitly described as not stated. They are not estimated.
- The PSI URL is the archive home page for every record.
- No API request is made at runtime.

## Accessibility

- The app has one main landmark, a skip link, and labeled navigation.
- The guided tour is a modal dialog with focus entry, a focus trap, Escape to close, and focus restoration.
- Charts have accessible names and optional table views.
- Form controls use labels. Live form messages use `role="status"`.
- Axe checks the main routes at WCAG A and AA in the Playwright suite.
- The layout is tested at 375, 768, 1280, and 1920 pixels for horizontal overflow.

## Reproducing the checks

```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npm run e2e
```

`npm run verify` runs all five in order.
