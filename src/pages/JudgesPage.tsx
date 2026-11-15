import { Link } from 'react-router-dom';
import { Page } from '../components/Page';

const criteria = [
  {
    name: 'Influence (Impact)',
    asks: 'Does the work matter to a crew and to the people planning a mission?',
    does: 'Turns archive metadata into a ranked decision output for five crew environments and prints a scenario brief with sources.',
    where: '/crew-fit',
    whereLabel: 'Crew Fit',
  },
  {
    name: 'Creativity',
    asks: 'Is there a distinct idea, not a restyled template?',
    does: 'A field notebook for combustion evidence, with a flame that morphs from an Earth teardrop to a free-fall sphere and a rules-based archive you can question.',
    where: '/',
    whereLabel: 'Home',
  },
  {
    name: 'Validity',
    asks: 'Are the claims, numbers and sources defensible?',
    does: 'Every derived number shows its formula. Unknown fields read not stated in brief. Deterministic tests pin the Moon atmosphere, Crew Fit order, search results, gaps and brief output.',
    where: '/method',
    whereLabel: 'Method',
  },
  {
    name: 'Relevance',
    asks: 'Does it answer the challenge question end to end?',
    does: 'Identify with Atlas and Crew Fit, extract with Data Room, highlight with Controls, then produce a Scenario Brief.',
    where: '/brief',
    whereLabel: 'Scenario Brief',
  },
  {
    name: 'Presentation',
    asks: 'Can a careful reader follow it without a guide?',
    does: 'Plates, captions, margin numbers, visible assumptions, a guided tour and a judges path. No hidden model.',
    where: '/judges',
    whereLabel: 'This page',
  },
];

const awards = [
  {
    name: 'Best Use of Science',
    asks: 'Uses the science, not just the theme.',
    does: 'Partial pressure, gravity, suppression by dilution and a declared gravity analog are treated as separate ideas.',
    where: '/atmosphere',
  },
  {
    name: 'Best Use of Data',
    asks: 'Makes data usable and traceable.',
    does: 'Data Room exports, a coverage heatmap, a dictionary, a CSV download and Ask the Archive reasons.',
    where: '/data',
  },
  {
    name: 'Best Use of Technology',
    asks: 'Uses the build to do something useful.',
    does: 'Offline browser reasoning, URL-addressable views, self-hosted fonts, strict TypeScript and automated accessibility checks.',
    where: '/ask',
  },
  {
    name: 'Best Mission Concept',
    asks: 'Turns evidence into a mission decision.',
    does: 'Crew Fit presets and the Scenario Brief make assumptions visible for lunar, Martian and rover planning.',
    where: '/brief',
  },
  {
    name: 'Best Storytelling',
    asks: 'Carries a reader from problem to conclusion.',
    does: 'The question, four incidents, the flame toggle, the archive, gaps and a printable brief.',
    where: '/',
  },
  {
    name: 'Art & Technology',
    asks: 'Shows craft in the interface and the implementation.',
    does: 'An original logo and flame, a notebook grid, colour-blind-safe gravity colours and charts drawn to scale.',
    where: '/glossary',
  },
  {
    name: 'Most Inspirational',
    asks: 'Leaves the audience with a next step.',
    does: 'Gaps names what the archive cannot answer, and the brief lists rule-based data needs for the next experiment.',
    where: '/gaps',
  },
];

export function JudgesPage() {
  return (
    <Page
      plate="14"
      title={
        <>
          Three minutes, four links, and the <em className="hl-em">evidence</em>.
        </>
      }
      lede="This page maps the scoring criteria and awards to working parts of Ghostflame. Every link below is a live route."
      wide
    >
      <section className="judges-path" aria-labelledby="path-title">
        <h2 id="path-title">The three-minute path.</h2>
        <ol>
          <li>
            <Link to="/crew-fit?preset=lunar">Crew Fit, Lunar base</Link>. See CFI-G first and E-FIELD
            second, with the why line and the weight formula.
          </li>
          <li>
            <Link to="/atmosphere?o=30&p=10.2">Atmosphere Lab at 30% and 10.2 psi</Link>. See 3.06 psi,
            -1% partial pressure and +43% oxygen fraction.
          </li>
          <li>
            <Link to="/ask?q=above+30%25+oxygen">Ask the Archive: above 30% oxygen</Link>. See the filter
            chips and the single result, CFI-G.
          </li>
          <li>
            <Link to="/brief">Scenario Brief</Link>. Choose Print or save as PDF and check the numbered
            sources.
          </li>
        </ol>
      </section>

      <section aria-labelledby="criteria-title">
        <div className="section-heading">
          <h2 id="criteria-title">Scoring criteria.</h2>
          <p className="section-note">The official guide calls Impact “Influence”.</p>
        </div>
        <div className="table-wrap">
          <table className="data-table judges-table">
            <caption className="visually-hidden">Criteria mapped to the site</caption>
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                <th scope="col">What it asks</th>
                <th scope="col">What Ghostflame does</th>
                <th scope="col">Where to see it</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion.name}>
                  <th scope="row">{criterion.name}</th>
                  <td>{criterion.asks}</td>
                  <td>{criterion.does}</td>
                  <td>
                    <Link to={criterion.where}>{criterion.whereLabel}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="awards-title">
        <div className="section-heading">
          <h2 id="awards-title">Awards this entry fits.</h2>
          <p className="section-note">Each row names a working path, not a promise of a win.</p>
        </div>
        <div className="table-wrap">
          <table className="data-table judges-table">
            <caption className="visually-hidden">Awards mapped to the site</caption>
            <thead>
              <tr>
                <th scope="col">Award</th>
                <th scope="col">What it asks</th>
                <th scope="col">What Ghostflame does</th>
                <th scope="col">Where to see it</th>
              </tr>
            </thead>
            <tbody>
              {awards.map((award) => (
                <tr key={award.name}>
                  <th scope="row">{award.name}</th>
                  <td>{award.asks}</td>
                  <td>{award.does}</td>
                  <td>
                    <Link to={award.where}>{award.where}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="summary-box" aria-labelledby="credit-title">
        <h2 id="credit-title">Credit.</h2>
        <p>
          Team Targaryen. Ghostflame was built for the NASA Space Apps Challenge. The challenge brief
          and NASA PSI metadata are the sources. The ranking, search, interface and generated artwork
          are original to this project.
        </p>
        <p className="small-note">
          No endorsement by NASA is claimed. No testimonial, user count or external metric is shown
          because none was supplied.
        </p>
      </section>
    </Page>
  );
}
