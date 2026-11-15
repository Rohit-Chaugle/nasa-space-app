import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { InvestigationCard } from '../components/InvestigationCard';
import {
  functionLabels,
  gravityLabels,
  inPsiRecords,
  phaseLabels,
  tierLabels,
} from '../data/investigations';
import type { Investigation } from '../data/schema';
import { coverageCount } from '../lib/coverage';
import { crewFitScore, getPreset, presets } from '../lib/scoring';
import { useArchive, COMPARE_LIMIT } from '../context/ArchiveContext';
import { useState } from 'react';

type View = 'table' | 'cards';
type Sort = 'name' | 'readiness' | 'fit';

const functionOptions = Object.entries(functionLabels) as Array<[string, string]>;
const phaseOptions = Object.entries(phaseLabels) as Array<[string, string]>;
const gravityOptions = Object.entries(gravityLabels).filter(([key]) => key !== 'partial') as Array<
  [string, string]
>;

function clean(value: string | null): string {
  return value ?? '';
}

export function AtlasPage() {
  const [params, setParams] = useSearchParams();
  const [trayMessage, setTrayMessage] = useState('');
  const { compare, addCompare, removeCompare, clearCompare, isCompared } = useArchive();

  const phase = clean(params.get('phase'));
  const hardware = clean(params.get('hardware'));
  const fn = clean(params.get('function'));
  const gravity = clean(params.get('gravity'));
  const tier = clean(params.get('tier'));
  const query = clean(params.get('q'));
  const sort = (clean(params.get('sort')) || 'name') as Sort;
  const view = (clean(params.get('view')) || 'table') as View;
  const fitPresetId = clean(params.get('fit'));

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const hardwareOptions = Array.from(new Set(inPsiRecords.map((record) => record.hardware))).sort();

  const filtered = inPsiRecords.filter((record) => {
    if (phase && !record.phases.includes(phase as Investigation['phases'][number])) return false;
    if (hardware && record.hardware !== hardware) return false;
    if (fn && !record.functions.includes(fn as Investigation['functions'][number])) return false;
    if (gravity && record.gravity !== gravity) return false;
    if (tier && record.tier !== tier) return false;
    if (query) {
      const text = `${record.name} ${record.acronym} ${record.objective}`.toLowerCase();
      if (!text.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const fitPreset = fitPresetId ? getPreset(fitPresetId) : null;
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'fit' && fitPreset) {
      const scoreDiff = crewFitScore(b, fitPreset) - crewFitScore(a, fitPreset);
      if (scoreDiff !== 0) return scoreDiff;
      const coverageDiff = coverageCount(b) - coverageCount(a);
      if (coverageDiff !== 0) return coverageDiff;
    }
    if (sort === 'readiness') {
      const coverageDiff = coverageCount(b) - coverageCount(a);
      if (coverageDiff !== 0) return coverageDiff;
    }
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
  });

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (view === 'cards') next.set('view', 'cards');
    setParams(next, { replace: true });
  };

  const addFromTable = (id: string) => {
    if (isCompared(id)) return;
    if (compare.length >= COMPARE_LIMIT) {
      setTrayMessage('Four records is the Compare limit. Remove one before adding another.');
      return;
    }
    addCompare(id);
    setTrayMessage('');
  };

  const activeFilterCount = [phase, hardware, fn, gravity, tier, query].filter(Boolean).length;

  return (
    <Page
      plate="02"
      title={
        <>
          Every record, with the filters kept in the <em className="hl-em">address</em>.
        </>
      }
      lede="The Atlas holds the 17 in-PSI records named in the brief. Table and card views show the same data. Planned records appear only under Gaps."
      wide
    >
      <section className="filter-panel" aria-labelledby="filters-title">
        <div className="section-heading compact">
          <h2 id="filters-title">Filters</h2>
          <p className="section-note">{activeFilterCount} active</p>
        </div>
        <div className="filter-grid">
          <label>
            <span className="mono-label">Phase</span>
            <select value={phase} onChange={(event) => setParam('phase', event.target.value)}>
              <option value="">All phases</option>
              {phaseOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono-label">Hardware</span>
            <select value={hardware} onChange={(event) => setParam('hardware', event.target.value)}>
              <option value="">All hardware</option>
              {hardwareOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono-label">Function</span>
            <select value={fn} onChange={(event) => setParam('function', event.target.value)}>
              <option value="">All functions</option>
              {functionOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono-label">Gravity</span>
            <select value={gravity} onChange={(event) => setParam('gravity', event.target.value)}>
              <option value="">All gravity</option>
              {gravityOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono-label">Tier</span>
            <select value={tier} onChange={(event) => setParam('tier', event.target.value)}>
              <option value="">All tiers</option>
              <option value="direct">Direct</option>
              <option value="related">Related</option>
            </select>
          </label>
          <label>
            <span className="mono-label">Search</span>
            <input
              type="search"
              value={query}
              placeholder="Name, acronym or objective"
              onChange={(event) => setParam('q', event.target.value)}
            />
          </label>
        </div>
        <div className="filter-footer">
          <label className="fit-select">
            <span className="mono-label">Crew Fit preset</span>
            <select
              value={fitPresetId}
              onChange={(event) => {
                const next = new URLSearchParams(params);
                if (event.target.value) {
                  next.set('fit', event.target.value);
                  next.set('sort', 'fit');
                } else {
                  next.delete('fit');
                  if (next.get('sort') === 'fit') next.set('sort', 'name');
                }
                setParams(next, { replace: true });
              }}
            >
              <option value="">No preset</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono-label">Sort</span>
            <select
              value={sort}
              onChange={(event) => setParam('sort', event.target.value)}
            >
              <option value="name">Name</option>
              <option value="readiness">Readiness</option>
              <option value="fit" disabled={!fitPresetId}>
                Crew Fit score
              </option>
            </select>
          </label>
          <div className="view-toggle" role="group" aria-label="View">
            <button type="button" aria-pressed={view === 'table'} onClick={() => setParam('view', 'table')}>
              Table
            </button>
            <button type="button" aria-pressed={view === 'cards'} onClick={() => setParam('view', 'cards')}>
              Cards
            </button>
          </div>
          <button type="button" className="btn quiet" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </section>

      <p className="result-count" aria-live="polite">
        {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
        {fitPreset ? `, sorted by ${fitPreset.name} fit` : ''}.
      </p>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <h2>No records match these filters.</h2>
          <p>Clear the filters to return to all 17 in-PSI records, or loosen one filter at a time.</p>
          <button type="button" className="btn primary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : view === 'table' ? (
        <div className="table-wrap">
          <table className="data-table atlas-table">
            <caption className="visually-hidden">Investigation records in the Atlas</caption>
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Tier</th>
                <th scope="col">Gravity</th>
                <th scope="col">Function</th>
                <th scope="col">Readiness</th>
                {fitPreset ? <th scope="col">Fit</th> : null}
                <th scope="col">Compare</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((record) => (
                <tr key={record.id}>
                  <th scope="row">
                    <Link to={`/investigations/${record.id}`}>{record.acronym}</Link>
                    <span className="table-sub">{record.name}</span>
                  </th>
                  <td>{tierLabels[record.tier]}</td>
                  <td>{gravityLabels[record.gravity]}</td>
                  <td>{record.functions.map((item) => functionLabels[item]).join(', ')}</td>
                  <td>{coverageCount(record)} of 6</td>
                  {fitPreset ? (
                    <td className="num">{crewFitScore(record, fitPreset).toFixed(1)}</td>
                  ) : null}
                  <td>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => addFromTable(record.id)}
                      disabled={isCompared(record.id)}
                      aria-pressed={isCompared(record.id)}
                    >
                      {isCompared(record.id) ? 'Added' : 'Add'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="record-grid">
          {sorted.map((record) => (
            <InvestigationCard
              key={record.id}
              record={record}
              score={fitPreset ? crewFitScore(record, fitPreset) : undefined}
            />
          ))}
        </div>
      )}

      {compare.length > 0 ? (
        <div className="compare-tray" aria-live="polite">
          <div className="tray-list">
            <span className="mono-label">Compare tray</span>
            {compare.map((id) => {
              const record = inPsiRecords.find((item) => item.id === id);
              if (!record) return null;
              return (
                <span key={id} className="tray-item">
                  {record.acronym}
                  <button
                    type="button"
                    onClick={() => removeCompare(id)}
                    aria-label={`Remove ${record.acronym} from Compare`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
          <div className="tray-actions">
            {trayMessage ? <span className="form-message">{trayMessage}</span> : null}
            <button type="button" className="text-button" onClick={clearCompare}>
              Clear
            </button>
            <Link className="btn primary" to="/compare">
              Compare {compare.length}
            </Link>
          </div>
        </div>
      ) : null}
    </Page>
  );
}
