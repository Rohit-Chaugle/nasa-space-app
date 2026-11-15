import { Link } from 'react-router-dom';
import { gravityLabels, tierLabels } from '../data/investigations';
import type { Investigation } from '../data/schema';
import { coverageLine } from '../lib/coverage';
import { useArchive } from '../context/ArchiveContext';

type Props = {
  record: Investigation;
  score?: number;
  note?: string;
};

export function InvestigationCard({ record, score, note }: Props) {
  const { addCompare, isCompared } = useArchive();
  const selected = isCompared(record.id);
  return (
    <article className="record-card">
      <div className="record-card-top">
        <span className="mono-label">{record.acronym}</span>
        <span className={`tier-tag tier-${record.tier}`}>{tierLabels[record.tier]}</span>
      </div>
      <h3>
        <Link to={`/investigations/${record.id}`}>{record.name}</Link>
      </h3>
      <p>{record.objective}</p>
      <dl className="record-facts">
        <div>
          <dt>Tier</dt>
          <dd>{tierLabels[record.tier]}</dd>
        </div>
        <div>
          <dt>Gravity</dt>
          <dd>{gravityLabels[record.gravity]}</dd>
        </div>
        <div>
          <dt>Readiness</dt>
          <dd>{coverageLine(record)}</dd>
        </div>
        {score !== undefined ? (
          <div>
            <dt>Fit</dt>
            <dd className="score-inline">{score.toFixed(1)} / 100</dd>
          </div>
        ) : null}
      </dl>
      {note ? <p className="card-note">{note}</p> : null}
      <div className="card-actions">
        <Link className="text-link" to={`/investigations/${record.id}`}>
          Open record
        </Link>
        <button
          type="button"
          className="text-button"
          onClick={() => addCompare(record.id)}
          aria-pressed={selected}
          disabled={selected}
        >
          {selected ? 'In Compare' : 'Add to Compare'}
        </button>
      </div>
    </article>
  );
}
