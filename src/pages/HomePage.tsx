import { Link } from 'react-router-dom';
import { FlameToggle } from '../components/FlameToggle';
import { Page } from '../components/Page';
import { Term } from '../components/Term';
import { inPsiRecords, plannedRecords } from '../data/investigations';
import { oxygenAbove30Records, partialGravityDataRecords } from '../lib/gaps';

const incidents = [
  {
    name: 'Apollo 1',
    detail: '1967 pre-launch test in an oxygen-filled spacecraft; crew lost.',
  },
  {
    name: 'Apollo 13',
    detail: 'Oxygen tank explosion on the way to the Moon.',
  },
  {
    name: 'Mir',
    detail: 'Fire from an oxygen generator failure; crew survived.',
  },
  {
    name: 'Artemis II',
    detail: 'Smoke alarm during the mission, as the commander described it.',
  },
];

export function HomePage() {
  const counts = [
    { label: 'Records named in the brief', value: inPsiRecords.length },
    { label: 'Planned records', value: plannedRecords.length },
    { label: 'Records with stated oxygen above 30%', value: oxygenAbove30Records().length },
    { label: 'Partial-gravity data records', value: partialGravityDataRecords().length },
  ];

  return (
    <Page
      plate="01"
      title={
        <>
          Which combustion experiments should a fire-safety engineer <em className="hl-em">trust</em>{' '}
          for a given crew environment, why, and what data can be pulled out for modeling?
        </>
      }
      lede="Ghostflame ranks the combustion investigations named in the challenge brief, shows the arithmetic behind every position, and writes a scenario brief from the same records."
      className="home-page"
    >
      <section className="home-hero" aria-labelledby="capabilities-title">
        <div className="home-hero-text">
          <p className="kicker">NASA Space Apps Challenge | Team Targaryen</p>
          <ol className="capability-list" aria-labelledby="capabilities-title">
            <li>
              <span className="capability-number">01</span>
              <div>
                <h2 id="capabilities-title">Identify the most relevant investigations.</h2>
                <p>
                  Rank records for a spacecraft cabin, space station, lunar base, Martian base or
                  pressurized rover in <Link to="/crew-fit">Crew Fit</Link>.
                </p>
              </div>
            </li>
            <li>
              <span className="capability-number">02</span>
              <div>
                <h2>Extract data that supports predictive modeling.</h2>
                <p>
                  See stated inputs, gaps and exportable metadata in the{' '}
                  <Link to="/data">Data Room</Link>.
                </p>
              </div>
            </li>
            <li>
              <span className="capability-number">03</span>
              <div>
                <h2>Highlight research for next-generation controls.</h2>
                <p>
                  Read prevention, detection and suppression evidence in{' '}
                  <Link to="/controls">Controls</Link>, then build a decision output in the{' '}
                  <Link to="/brief">Scenario Brief</Link>.
                </p>
              </div>
            </li>
          </ol>
          <p className="method-inline">
            The reasoning layer runs in your browser: deterministic rules plus text similarity. No
            external AI service, no API key, no network call after first load. Read the{' '}
            <Link to="/method">method</Link>.
          </p>
        </div>
        <FlameToggle />
      </section>

      <section className="incident-section" aria-labelledby="incidents-title">
        <div className="section-heading">
          <h2 id="incidents-title">Crew fire safety is not a hypothetical.</h2>
          <p className="section-note">Four incidents described in the challenge brief.</p>
        </div>
        <ol className="incident-strip">
          {incidents.map((incident, index) => (
            <li key={incident.name}>
              <span className="incident-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{incident.name}</h3>
              <p>{incident.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="counts-section" aria-labelledby="counts-title">
        <div className="section-heading">
          <h2 id="counts-title">The archive at a glance.</h2>
          <p className="section-note">Computed from the 19 records in src/data/investigations.json.</p>
        </div>
        <dl className="count-grid">
          {counts.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="small-note">
          Partial-gravity data is absent. The archive holds microgravity work and one{' '}
          <Term>partial-gravity analog</Term>. Two planned investigations, LUCI and FM2, have no PSI
          data yet. See <Link to="/gaps">Gaps</Link>.
        </p>
      </section>
    </Page>
  );
}
