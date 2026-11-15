import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { useArchive, COMPARE_LIMIT } from '../context/ArchiveContext';
import {
  functionLabels,
  gravityLabels,
  inPsiRecords,
  investigations,
  phaseLabels,
  tierLabels,
} from '../data/investigations';
import type { Investigation } from '../data/schema';
import { allColumns } from '../lib/fields';
import { downloadCsv } from '../lib/export';

const compareKeys = [
  'acronym',
  'name',
  'phases',
  'hardware',
  'functions',
  'variables',
  'measurements',
  'tier',
  'gravity',
  'oxygen',
  'pressure',
  'airflow',
  'fuelIdentity',
  'fuelGeometry',
  'verification',
];

const compareColumns = allColumns.filter((column) => compareKeys.includes(column.key));

type CompareRow = {
  label: string;
  value: (record: Investigation) => string;
};

const rows: CompareRow[] = [
  {
    label: 'Phase',
    value: (record) =>
      record.phases.length > 0
        ? record.phases.map((phase) => phaseLabels[phase]).join(', ')
        : 'not stated in brief',
  },
  { label: 'Hardware', value: (record) => record.hardware },
  {
    label: 'Function',
    value: (record) => record.functions.map((fn) => functionLabels[fn]).join(', '),
  },
  {
    label: 'Variables',
    value: (record) => (record.variables.length > 0 ? record.variables.join('; ') : 'not stated in brief'),
  },
  {
    label: 'Measurements',
    value: (record) =>
      record.measurements.length > 0 ? record.measurements.join('; ') : 'not stated in brief',
  },
  { label: 'Tier', value: (record) => tierLabels[record.tier] },
  { label: 'Gravity', value: (record) => gravityLabels[record.gravity] },
  {
    label: 'Oxygen',
    value: (record) => (record.readiness.oxygen.stated ? record.readiness.oxygen.value : 'not stated in brief'),
  },
  {
    label: 'Pressure',
    value: (record) => (record.readiness.pressure.stated ? record.readiness.pressure.value : 'not stated in brief'),
  },
  {
    label: 'Airflow',
    value: (record) => (record.readiness.airflow.stated ? record.readiness.airflow.value : 'not stated in brief'),
  },
  {
    label: 'Fuel identity',
    value: (record) =>
      record.readiness.fuelIdentity.stated ? record.readiness.fuelIdentity.value : 'not stated in brief',
  },
  {
    label: 'Fuel geometry',
    value: (record) =>
      record.readiness.fuelGeometry.stated ? record.readiness.fuelGeometry.value : 'not stated in brief',
  },
  { label: 'Verification', value: (record) => record.source.verification },
];

function isUnknown(value: string): boolean {
  return value === 'not stated in brief' || value.startsWith('not stated');
}

export function ComparePage() {
  const { compare, addCompare, removeCompare, clearCompare } = useArchive();
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const records = compare
    .map((id) => investigations.find((record) => record.id === id))
    .filter((record): record is Investigation => Boolean(record) && record?.status === 'in_psi');

  const available = inPsiRecords.filter((record) => !compare.includes(record.id));
  const canAdd = compare.length < COMPARE_LIMIT;
  const differing = rows.filter(
    (row) => new Set(records.map((record) => row.value(record))).size > 1,
  );

  const add = () => {
    if (!selectedId) return;
    if (!canAdd) {
      setMessage('Four records is the limit. Remove one before adding another.');
      return;
    }
    addCompare(selectedId);
    setSelectedId('');
    setMessage('');
  };

  const summary = (() => {
    if (records.length < 2) return '';
    const sharedFunctions = records
      .map((record) => record.functions)
      .reduce((shared, functions) => shared.filter((fn) => functions.includes(fn)));
    const sharedPhases = records
      .map((record) => record.phases)
      .reduce((shared, phases) => shared.filter((phase) => phases.includes(phase)));
    const sameGravity = new Set(records.map((record) => record.gravity)).size === 1;
    const sameTier = new Set(records.map((record) => record.tier)).size === 1;
    const sharedHardware = new Set(records.map((record) => record.hardware));
    const parts = [
      sharedFunctions.length > 0
        ? `Shared functions: ${sharedFunctions.map((fn) => functionLabels[fn]).join(', ')}.`
        : 'No function is shared by every selected record.',
      sharedPhases.length > 0
        ? `Shared phases: ${sharedPhases.map((phase) => phaseLabels[phase]).join(', ')}.`
        : 'No phase is shared by every selected record.',
      sharedHardware.size === 1 ? `Shared hardware: ${[...sharedHardware][0]}.` : 'Hardware differs.',
      sameGravity ? `All records use ${gravityLabels[records[0]!.gravity]}.` : 'Gravity differs.',
      sameTier ? `All records are ${tierLabels[records[0]!.tier].toLowerCase()} tier.` : 'Tier differs.',
      differing.length > 0 ? `Fields that differ: ${differing.map((row) => row.label).join(', ')}.` : 'Every displayed field is shared.',
    ];
    return parts.join(' ');
  })();

  return (
    <Page
      plate="09"
      title={
        <>
          Two to four records, <em className="hl-em">difference</em> marked.
        </>
      }
      lede="Compare the fields the brief states. Unknown values stay visibly unknown. The summary below the table is generated from the selected records."
      wide
    >
      <section className="compare-controls" aria-labelledby="compare-picker-title">
        <h2 id="compare-picker-title" className="visually-hidden">
          Choose records to compare
        </h2>
        <label>
          <span className="mono-label">Add a record</span>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={!canAdd || available.length === 0}
          >
            <option value="">
              {available.length === 0 ? 'All in-PSI records are selected' : 'Choose a record'}
            </option>
            {available.map((record) => (
              <option key={record.id} value={record.id}>
                {record.acronym} - {record.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={add} disabled={!selectedId || !canAdd}>
          Add to Compare
        </button>
        {!canAdd ? <span className="small-note">Four is the limit. Remove one to change the set.</span> : null}
        {compare.length > 0 ? (
          <button type="button" className="btn quiet" onClick={clearCompare}>
            Clear all
          </button>
        ) : null}
        <span className="form-message" role="status">
          {message}
        </span>
      </section>

      {records.length < 2 ? (
        <div className="empty-state">
          <h2>Select at least two records.</h2>
          <p>
            The Compare page puts records side by side. You have {records.length} selected. Use the
            picker above, or choose from the <Link to="/atlas">Atlas</Link>.
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table compare-table">
              <caption className="visually-hidden">Side-by-side comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  {records.map((record) => (
                    <th key={record.id} scope="col">
                      <Link to={`/investigations/${record.id}`}>{record.acronym}</Link>
                      <span className="table-sub">{record.name}</span>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => removeCompare(record.id)}
                        aria-label={`Remove ${record.acronym} from Compare`}
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const values = records.map((record) => row.value(record));
                  const differs = new Set(values).size > 1;
                  return (
                    <tr key={row.label} className={differs ? 'diff-row' : ''}>
                      <th scope="row">
                        {row.label}
                        {differs ? <span className="diff-tag">Differs</span> : null}
                      </th>
                      {values.map((value, index) => (
                        <td key={records[index]!.id} className={isUnknown(value) ? 'unknown' : ''}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <section className="summary-box" aria-labelledby="compare-summary-title">
            <h2 id="compare-summary-title">Generated summary</h2>
            <p>{summary}</p>
            <div className="button-row">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  downloadCsv(
                    'ghostflame-compare.csv',
                    records,
                    compareColumns,
                  )
                }
              >
                Download CSV
              </button>
              <button type="button" className="btn quiet" onClick={() => downloadCsv('ghostflame-compare-all-fields.csv', records, allColumns)}>
                Download all fields CSV
              </button>
            </div>
            <p className="small-note">
              The CSV has one row per record and the same columns as the table, with all six readiness
              values and stated flags in the full export.
            </p>
          </section>
        </>
      )}

      {compare.length > records.length ? (
        <p className="small-note">
          One or more selected IDs are not available as in-PSI records. Clear the set and choose
          again.
        </p>
      ) : null}

      <section className="formula-section" aria-labelledby="compare-method-title">
        <h2 id="compare-method-title">How the comparison reads.</h2>
        <p>
          A cell is marked differs when at least two selected records have different text. Values the
          brief does not state read not stated in brief in Ash. The site does not fill missing values
          from a guess.
        </p>
      </section>
    </Page>
  );
}
