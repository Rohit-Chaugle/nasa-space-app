import { Page } from '../components/Page';
import { Term } from '../components/Term';
import { ACME_TOTAL, acmeNamedRecords } from '../lib/gaps';
import { factorLabels, FACTOR_KEYS } from '../lib/scoring';

const criteria = [
  ['Data source', 'Challenge brief, section 4 (Data), for the 19 records and their fields; NASA PSI home page for the archive entry point.'],
  ['Record status', 'Every record is named_in_brief. The brief supplies the name and stated fields, not results.'],
  ['Tier', 'Direct means the brief names the record for a crew fire-safety function. Related means the brief names it with a weaker or name-only connection. Planned means no PSI data yet.'],
  ['Atmosphere values', '14.7 psi, 4.3 psi, 10.2 psi and the 30% lunar planning point come from the brief. The 21% Earth oxygen fraction is a standard value and is labeled as not from the brief.'],
  ['Missing values', 'A field the brief does not state reads “not stated in brief” everywhere. No value is inferred.'],
  ['Raw data', 'No raw sensor data is hosted or analyzed. PSI holds the raw data.'],
];

export function MethodPage() {
  const acme = acmeNamedRecords().length;
  return (
    <Page
      plate="13"
      title={
        <>
          The method is part of the <em className="hl-em">evidence</em>.
        </>
      }
      lede="This page lists the sources, status meanings, every formula, and the boundary between the archive and our interpretation."
      wide
    >
      <section aria-labelledby="method-sources-title">
        <h2 id="method-sources-title">Sources and status.</h2>
        <div className="table-wrap">
          <table className="data-table">
            <caption className="visually-hidden">Data sources and status meanings</caption>
            <tbody>
              {criteria.map(([label, text]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="method-formulas-title">
        <h2 id="method-formulas-title">Formulas.</h2>
        <div className="formula-list">
          <p>
            <strong>Oxygen partial pressure</strong> = oxygen fraction × total pressure. At the Moon
            planning point, 30% × 10.2 psi = 3.06 psi. At Earth sea level, 21% × 14.7 psi = 3.09 psi
            (3.087 psi before rounding).
          </p>
          <p>
            <strong>Percent change</strong> = (value − baseline) ÷ baseline × 100. Moon partial
            pressure against Earth is -1% after rounding; the 30% oxygen fraction against 21% is +43%.
            The spacesuit at 4.3 psi is +39% against Earth's partial pressure.
          </p>
          <p>
            <strong>Crew Fit score</strong> = 100 × sum(weight × factor) over{' '}
            {FACTOR_KEYS.map((key) => factorLabels[key]).join(', ')}. Function is 1 primary, 0.5
            secondary, 0 otherwise. Oxygen is 1 at 30% or more, 0.5 below 30%, 0.2 if not stated.
            Gravity is 1 for a match, 0.5 for a bound, 0 otherwise; the partial-gravity analog is
            treated as a match for surface presets and labeled as an analog on the record. Tier is 1
            direct, 0.4 related. Readiness = stated inputs ÷ 6. Sliders normalize to 1. Ties break on
            readiness, then name.
          </p>
          <p>
            <strong>Coverage</strong> = number of stated readiness inputs out of six. The six are
            oxygen, total pressure, airflow, fuel identity, fuel geometry and measurement.
          </p>
          <p>
            <strong>Search</strong>: synonym phrases become filters. A record gets 10 points per
            matched concept, plus 4 × unmatched-word TF-IDF cosine similarity, plus full-query TF-IDF
            cosine similarity. Ties break on direct tier, readiness, then name. Planned records are
            listed separately and never scored.
          </p>
          <p>
            <strong>Scenario Brief</strong>: Crew Fit weights for the chosen environment. A focus adds
            its function to the preset primary set and adds 0.15 to the Function weight before
            renormalization. The top five in-PSI records fill the template. Planned records never enter
            the ranking.
          </p>
          <p>
            <strong>Gaps</strong>: counts computed directly from the JSON dataset. The gap page lists
            the six predicates. No gap number is typed into the page.
          </p>
        </div>
      </section>

      <section aria-labelledby="method-automation-title">
        <h2 id="method-automation-title">What is automated.</h2>
        <p>
          The explainable layer has two deterministic parts: a rules parser with a fixed synonym table,
          and TF-IDF text similarity over the record text. There is no external AI service, no model
          download and no API key. Identical inputs produce identical order and identical numbers in
          the app and in the tests. The brief generation is a template filled from records and the
          atmosphere formulas.
        </p>
        <p>
          The site works offline after the first load. Fonts are self-hosted, the data is bundled, and
          the PSI address is a link the user may choose to open. No runtime call is made to NASA.
        </p>
        <p className="formula-line">
          {acme} of {ACME_TOTAL} <Term term="ACME">ACME</Term> experiments are named in the challenge
          brief.
        </p>
      </section>

      <section aria-labelledby="method-limits-title">
        <h2 id="method-limits-title">Limitations.</h2>
        <ul className="plain-list">
          <li>The archive in this site is the 19 records named in the brief, not all of PSI.</li>
          <li>Every field is brief metadata. There are no test results, no raw sensor traces and no measured rates.</li>
          <li>Only one record states an oxygen level, and only one states a value above 30%. No record states a test pressure or a numeric airflow.</li>
          <li>The archive holds microgravity data and an electric-field analog. Partial-gravity data records = 0.</li>
          <li>The scoring is a decision aid, not a NASA finding. Crew Fit weights are declared assumptions.</li>
          <li>Search is lexical. A synonym the table does not know appears as an unmatched text term and may miss a relevant record.</li>
          <li>The Scenario Brief is a planning document. It is not a certification, a test plan or a substitute for a fire-safety analysis.</li>
        </ul>
      </section>

      <section aria-labelledby="method-refs-title">
        <h2 id="method-refs-title">References.</h2>
        <p className="small-note">
          REFERENCES.md in the repository holds the complete list, including font licenses and generated
          assets.
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <caption className="visually-hidden">Libraries, fonts, data and generated assets</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Use</th>
                <th scope="col">License or source</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">React and React DOM</th><td>User interface</td><td>MIT</td></tr>
              <tr><th scope="row">React Router</th><td>Hash routing</td><td>MIT</td></tr>
              <tr><th scope="row">zod</th><td>Dataset validation</td><td>MIT</td></tr>
              <tr><th scope="row">d3-scale and d3-shape</th><td>Chart scales and line geometry</td><td>ISC</td></tr>
              <tr><th scope="row">Vite, Vitest, Playwright</th><td>Build and tests</td><td>MIT / MIT / Apache-2.0</td></tr>
              <tr><th scope="row">Newsreader</th><td>Headlines</td><td>SIL Open Font License 1.1</td></tr>
              <tr><th scope="row">Hanken Grotesk</th><td>Body text</td><td>SIL Open Font License 1.1</td></tr>
              <tr><th scope="row">IBM Plex Mono</th><td>Numbers and labels</td><td>SIL Open Font License 1.1</td></tr>
              <tr><th scope="row">NASA PSI</th><td>Archive entry point</td><td><a href="https://psi.nasa.gov/" rel="noreferrer">psi.nasa.gov</a></td></tr>
              <tr><th scope="row">Challenge brief</th><td>Records, environment points, Earth applications</td><td>NASA Space Apps Challenge brief</td></tr>
              <tr><th scope="row">Logo and flame SVG</th><td>Original artwork drawn for this project</td><td>Original, MIT project license</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </Page>
  );
}
