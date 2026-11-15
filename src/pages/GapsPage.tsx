import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { plannedRecords } from '../data/investigations';
import { computeGaps } from '../lib/gaps';

export function GapsPage() {
  const gaps = computeGaps();
  return (
    <Page
      plate="11"
      title={
        <>
          What the archive cannot answer is a <em className="hl-em">finding</em> too.
        </>
      }
      lede="Every gap below is computed from the records, not typed by hand. Each one says why it matters for a crew and where the consequence appears in the site."
      wide
    >
      <ol className="gap-list">
        {gaps.map((gap, index) => (
          <li key={gap.id}>
            <span className="gap-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="gap-body">
              <div className="gap-head">
                <h2>{gap.title}</h2>
                <span className="gap-value">{gap.value}</span>
              </div>
              <p>{gap.why}</p>
              <p className="small-note">
                See <Link to={gap.href.replace('#', '')}>{gap.hrefLabel}</Link>.
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="planned-section" aria-labelledby="planned-title">
        <div className="section-heading">
          <h2 id="planned-title">Planned records.</h2>
          <p className="section-note">
            These appear only here and on their own investigation pages. They are never ranked,
            compared or exported.
          </p>
        </div>
        <ul className="planned-list">
          {plannedRecords.map((record) => (
            <li key={record.id}>
              <span className="mono-label">Planned</span>
              <h3>
                <Link to={`/investigations/${record.id}`}>{record.acronym}</Link>
              </h3>
              <p>{record.objective}</p>
              <p className="unknown">{record.conditions}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="formula-section" aria-labelledby="gaps-method-title">
        <h2 id="gaps-method-title">How this list is computed.</h2>
        <ul className="plain-list">
          <li>Partial-gravity data records = in-PSI records with gravity = partial (currently 0).</li>
          <li>Planned records = records with status = planned (currently 2).</li>
          <li>
            ACME experiments named = records whose hardware contains ACME (currently 3), out of the 6
            ACME experiments the brief states.
          </li>
          <li>
            Stated oxygen above 30% = records with a stated oxygen level greater than 30% (currently 1).
          </li>
          <li>Stated test pressure = records with the pressure readiness input marked stated (currently 0).</li>
          <li>Numeric airflow = records with the airflow readiness input marked stated (currently 0).</li>
        </ul>
      </section>
    </Page>
  );
}
