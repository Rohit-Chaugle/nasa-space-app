import { Link, useParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { Term } from '../components/Term';
import {
  functionLabels,
  getInvestigation,
  gravityLabels,
  phaseLabels,
  readinessKeys,
  readinessLabels,
  relationshipsFor,
  tierLabels,
} from '../data/investigations';
import { coverageCount } from '../lib/coverage';
import { useArchive, COMPARE_LIMIT, PIN_LIMIT } from '../context/ArchiveContext';
import { useState } from 'react';

export function InvestigationPage() {
  const { id } = useParams();
  const record = id ? getInvestigation(id) : undefined;
  const { addCompare, isCompared, compare, addPin, isPinned, pins } = useArchive();
  const [message, setMessage] = useState('');

  if (!record) {
    return (
      <Page
        plate="00"
        title={
          <>
            No investigation has that <em className="hl-em">identifier</em>.
          </>
        }
        lede="The record may have been mistyped. Use the Atlas to find one of the 19 records."
      >
        <div className="notice">
          <p>Open the Atlas to browse the records named in the brief.</p>
          <Link className="btn primary" to="/atlas">
            Open Atlas
          </Link>
        </div>
      </Page>
    );
  }

  const relationships = relationshipsFor(record.id);
  const unknown = 'not stated in brief';

  const addToCompare = () => {
    if (compare.length >= COMPARE_LIMIT) {
      setMessage('Four records is the Compare limit. Remove one on the Compare page first.');
      return;
    }
    addCompare(record.id);
    setMessage(isCompared(record.id) ? 'Already in Compare.' : 'Added to Compare.');
  };

  const pinToBrief = () => {
    if (pins.length >= PIN_LIMIT) {
      setMessage('Five records is the brief pin limit. Remove one on the Scenario Brief page.');
      return;
    }
    addPin(record.id);
    setMessage(isPinned(record.id) ? 'Already pinned for the Scenario Brief.' : 'Pinned for the Scenario Brief.');
  };

  return (
    <Page
      plate="02A"
      title={
        <>
          {record.acronym}: <em className="hl-em">{record.name}</em>
        </>
      }
      lede={record.objective}
      wide
    >
      <section className="record-header" aria-label="Record status">
        <dl className="stat-row">
          <div>
            <dt>Status</dt>
            <dd>{record.status === 'in_psi' ? 'In PSI' : 'Planned'}</dd>
          </div>
          <div>
            <dt>Tier</dt>
            <dd>{tierLabels[record.tier]}</dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd className="mono-value">{record.source.verification}</dd>
          </div>
          <div>
            <dt>Readiness</dt>
            <dd>{coverageCount(record)} of 6 inputs</dd>
          </div>
        </dl>
        <div className="button-row">
          <button
            type="button"
            className="btn primary"
            onClick={addToCompare}
            disabled={isCompared(record.id)}
          >
            {isCompared(record.id) ? 'In Compare' : 'Add to Compare'}
          </button>
          <button type="button" className="btn" onClick={pinToBrief} disabled={isPinned(record.id)}>
            {isPinned(record.id) ? 'Pinned to Brief' : 'Add to Scenario Brief'}
          </button>
        </div>
        <p className="form-message" role="status">
          {message}
        </p>
      </section>

      <section className="record-section" aria-labelledby="stated-title">
        <div className="section-heading">
          <h2 id="stated-title">What the brief states.</h2>
          <p className="section-note">Everything below comes from the record description, not from a test result.</p>
        </div>
        <div className="table-wrap">
          <table className="data-table stated-table">
            <caption className="visually-hidden">Brief statements for {record.acronym}</caption>
            <tbody>
              <tr>
                <th scope="row">Fuel</th>
                <td>{record.fuel}</td>
              </tr>
              <tr>
                <th scope="row">Hardware</th>
                <td>{record.hardware}</td>
              </tr>
              <tr>
                <th scope="row">Conditions and function</th>
                <td>{record.conditions}</td>
              </tr>
              <tr>
                <th scope="row">Phase</th>
                <td>{record.phases.length > 0 ? record.phases.map((phase) => phaseLabels[phase]).join(', ') : unknown}</td>
              </tr>
              <tr>
                <th scope="row">Functions</th>
                <td>{record.functions.map((fn) => functionLabels[fn]).join(', ')}</td>
              </tr>
              <tr>
                <th scope="row">Gravity</th>
                <td>{gravityLabels[record.gravity]}</td>
              </tr>
              <tr>
                <th scope="row">Oxygen level</th>
                <td>{record.readiness.oxygen.stated ? record.readiness.oxygen.value : unknown}</td>
              </tr>
              <tr>
                <th scope="row">Total pressure</th>
                <td>{record.readiness.pressure.stated ? record.readiness.pressure.value : unknown}</td>
              </tr>
              <tr>
                <th scope="row">Airflow</th>
                <td>{record.readiness.airflow.stated ? record.readiness.airflow.value : unknown}</td>
              </tr>
              <tr>
                <th scope="row">Fuel identity</th>
                <td>{record.readiness.fuelIdentity.stated ? record.readiness.fuelIdentity.value : unknown}</td>
              </tr>
              <tr>
                <th scope="row">Fuel geometry</th>
                <td>{record.readiness.fuelGeometry.stated ? record.readiness.fuelGeometry.value : unknown}</td>
              </tr>
              <tr>
                <th scope="row">Measurement</th>
                <td>{record.readiness.measurement.stated ? record.readiness.measurement.value : unknown}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="split-sections">
        <section className="record-section" aria-labelledby="variables-title">
          <h2 id="variables-title">Variables and measurements.</h2>
          <h3>Variables named in the brief</h3>
          {record.variables.length > 0 ? (
            <ul className="plain-list">
              {record.variables.map((variable) => (
                <li key={variable}>{variable}</li>
              ))}
            </ul>
          ) : (
            <p className="unknown">{unknown}</p>
          )}
          <h3>Measurements named in the brief</h3>
          {record.measurements.length > 0 ? (
            <ul className="plain-list">
              {record.measurements.map((measurement) => (
                <li key={measurement}>{measurement}</li>
              ))}
            </ul>
          ) : (
            <p className="unknown">{unknown}</p>
          )}
        </section>

        <section className="record-section" aria-labelledby="readiness-title">
          <h2 id="readiness-title">Six readiness inputs.</h2>
          <p className="small-note">
            Coverage is the number marked stated, divided by six. Crew Fit uses that fraction.
          </p>
          <ul className="readiness-list">
            {readinessKeys.map((key) => (
              <li key={key}>
                <span>{readinessLabels[key]}</span>
                <span className={record.readiness[key].stated ? 'state-stated' : 'state-unknown'}>
                  {record.readiness[key].stated ? record.readiness[key].value : 'not stated in brief'}
                </span>
              </li>
            ))}
          </ul>
          <p className="formula-line">
            Coverage = {coverageCount(record)} stated ÷ 6 = {(coverageCount(record) / 6).toFixed(3)}
          </p>
        </section>
      </div>

      <section className="record-section" aria-labelledby="relationships-title">
        <h2 id="relationships-title">Shared hardware and programs.</h2>
        {relationships.length > 0 ? (
          <ul className="relationship-list">
            {relationships.map((group) => (
              <li key={group.id}>
                <strong>{group.label}</strong>: {group.note}{' '}
                {group.others.map((otherId) => {
                  const other = getInvestigation(otherId);
                  if (!other) return null;
                  return (
                    <Link key={otherId} to={`/investigations/${otherId}`} className="record-link">
                      {other.acronym}
                    </Link>
                  );
                })}
              </li>
            ))}
          </ul>
        ) : (
          <p className="unknown">No shared group named in the brief for this record.</p>
        )}
        <p className="small-note">
          <Term term="CIR">CIR</Term>, <Term term="MDCA">MDCA</Term>, <Term term="MSG">MSG</Term>,{' '}
          <Term term="ACME">ACME</Term> and <Term term="PSI">PSI</Term> are defined in the Glossary.
        </p>
      </section>

      <section className="source-box" aria-labelledby="source-title">
        <h2 id="source-title">Source and verification.</h2>
        <dl className="source-list">
          <div>
            <dt>Brief section</dt>
            <dd>{record.source.section}</dd>
          </div>
          <div>
            <dt>PSI address</dt>
            <dd>
              <a href={record.source.psi_url} rel="noreferrer">
                {record.source.psi_url}
              </a>
            </dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd className="mono-value">{record.source.verification}</dd>
          </div>
        </dl>
        <p className="small-note">
          The brief confirms the record name and the fields shown above. It does not supply raw sensor
          data. Raw data lives in PSI.
        </p>
      </section>
    </Page>
  );
}
