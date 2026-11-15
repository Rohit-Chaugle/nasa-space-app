import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { Term } from '../components/Term';

const entries = [
  {
    title: 'Fine-water-mist extinguishers for the ISS',
    brief:
      'The brief names fine-water-mist extinguishers developed for the International Space Station. Fine droplets absorb heat and can displace oxygen in the fire zone.',
    area: 'Suppression',
    areaLink: '/controls',
    record: 'The brief does not name a specific archive record for this item.',
  },
  {
    title: 'Smoke detection on Earth',
    brief:
      'The brief says NASA technology improved terrestrial smoke detection. The archive contains microgravity smoke detection work, but the brief does not connect a named record to the Earth product.',
    area: 'Detection',
    areaLink: '/controls',
    record: 'The brief does not name a specific archive record for this item.',
  },
  {
    title: 'Firefighter protective clothing and air tanks',
    brief:
      'The brief names firefighter gear, including protective clothing and air tanks, as an Earth application. It does not state a material or a test result from the archive.',
    area: 'Prevention and suppression',
    areaLink: '/controls',
    record: 'The brief does not name a specific archive record for this item.',
  },
];

export function EarthPage() {
  return (
    <Page
      plate="10"
      title={
        <>
          The same fire problem, back on <em className="hl-em">Earth</em>.
        </>
      }
      lede="The challenge brief names three Earth applications. Each one is shown here with what the brief actually says, without a made-up link to an experiment."
      wide
    >
      <div className="earth-list">
        {entries.map((entry, index) => (
          <article key={entry.title} className="earth-entry">
            <span className="earth-index">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{entry.title}</h2>
              <p>{entry.brief}</p>
              <dl className="earth-facts">
                <div>
                  <dt>Related archive area</dt>
                  <dd>
                    <Link to={entry.areaLink}>{entry.area}</Link>
                  </dd>
                </div>
                <div>
                  <dt>Named archive record</dt>
                  <dd>{entry.record}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
      <p className="small-note">
        <Term>fine water mist</Term> is defined in the Glossary. The Earth page does not claim a
        performance result, a deployment date or a count of people helped.
      </p>
    </Page>
  );
}
