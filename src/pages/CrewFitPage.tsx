import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { inPsiRecords } from '../data/investigations';
import { coverageCount } from '../lib/coverage';
import { copyText } from '../lib/export';
import {
  FACTOR_KEYS,
  factorLabels,
  getPreset,
  matrixScores,
  normalizeWeights,
  presets,
  rankByPreset,
  setNormalizedWeight,
  weightsSum,
  whyLine,
  GRAVITY_ANALOG_NOTE,
  type FactorKey,
  type Weights,
} from '../lib/scoring';

function parseWeights(value: string | null, fallback: Weights): Weights {
  if (!value) return normalizeWeights(fallback);
  const numbers = value.split(',').map(Number);
  if (numbers.length !== 5 || numbers.some((number) => !Number.isFinite(number) || number < 0)) {
    return normalizeWeights(fallback);
  }
  return normalizeWeights({
    function: numbers[0]!,
    oxygen: numbers[1]!,
    gravity: numbers[2]!,
    tier: numbers[3]!,
    readiness: numbers[4]!,
  });
}

function encodeWeights(weights: Weights): string {
  return FACTOR_KEYS.map((key) => (weights[key] * 100).toFixed(1)).join(',');
}

export function CrewFitPage() {
  const [params, setParams] = useSearchParams();
  const presetId = params.get('preset') ?? 'lunar';
  const preset = getPreset(presetId);
  const weights = parseWeights(params.get('w'), preset.weights);
  const [shareStatus, setShareStatus] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);
  const ranked = rankByPreset(inPsiRecords, preset, weights);
  const matrix = matrixScores(inPsiRecords);

  const setPreset = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('preset', id);
    next.delete('w');
    setParams(next, { replace: true });
  };

  const setWeight = (key: FactorKey, percent: number) => {
    const nextWeights = setNormalizedWeight(weights, key, percent / 100);
    const next = new URLSearchParams(params);
    next.set('preset', preset.id);
    next.set('w', encodeWeights(nextWeights));
    setParams(next, { replace: true });
  };

  const reset = () => {
    const next = new URLSearchParams();
    next.set('preset', preset.id);
    setParams(next, { replace: true });
  };

  const share = async () => {
    try {
      await copyText(window.location.href);
      setShareStatus('Share link copied.');
    } catch {
      setShareStatus('Copy failed. Select the address bar and copy the URL.');
    }
  };

  return (
    <Page
      plate="03"
      title={
        <>
          A score you can argue with, not a black <em className="hl-em">box</em>.
        </>
      }
      lede="Choose a crew environment. Five weights set what matters. Every record gets a score from 0 to 100, and the line beneath says what held it back."
      wide
    >
      <section aria-labelledby="preset-title">
        <div className="section-heading">
          <h2 id="preset-title">Crew environment</h2>
          <p className="section-note">{preset.sentence}</p>
        </div>
        <div className="preset-row" role="group" aria-label="Crew environment presets">
          {presets.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`preset-button ${item.id === preset.id ? 'selected' : ''}`}
              aria-pressed={item.id === preset.id}
              onClick={() => setPreset(item.id)}
            >
              <span>{item.name}</span>
              <span className="preset-gravity">{item.gravity === 'partial' ? 'partial gravity' : 'microgravity'}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="fit-layout">
        <section className="weights-panel" aria-labelledby="weights-title">
          <div className="section-heading compact">
            <h2 id="weights-title">Weights</h2>
            <p className="section-note">Sliders re-normalize to 100%.</p>
          </div>
          {FACTOR_KEYS.map((key) => {
            const value = Math.round(weights[key] * 100);
            return (
              <label key={key} className="weight-row">
                <span>{factorLabels[key]}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={value}
                  onChange={(event) => setWeight(key, Number(event.target.value))}
                  aria-valuetext={`${value} percent`}
                />
                <output>{value}%</output>
              </label>
            );
          })}
          <div className="weight-footer">
            <span className="mono-label">Total {(weightsSum(weights) * 100).toFixed(1)}%</span>
            <button type="button" className="btn quiet" onClick={reset}>
              Reset weights
            </button>
          </div>
          <div className="formula-box">
            <p className="mono-label">Formula</p>
            <p>
              Score = 100 × (Function weight × function factor + Oxygen weight × oxygen factor +
              Gravity weight × gravity factor + Tier weight × tier factor + Readiness weight ×
              readiness factor).
            </p>
            <p className="small-note">
              Function is 1 for a preset primary, 0.5 for a secondary, 0 otherwise. Oxygen is 1 at
              30% or more, 0.5 below 30%, 0.2 when not stated. Gravity is 1 for a match, 0.5 for a
              bound, 0 otherwise. Tier is 1 direct, 0.4 related. Readiness is stated inputs ÷ 6.
              Ties break on readiness, then name.
            </p>
            <p className="small-note">{GRAVITY_ANALOG_NOTE}</p>
          </div>
        </section>

        <section className="rank-panel" aria-labelledby="rank-title">
          <div className="section-heading compact">
            <h2 id="rank-title">Ranked for {preset.name}.</h2>
            <p className="section-note">{ranked.length} in-PSI records. Planned records are never ranked.</p>
          </div>
          <ol className="rank-list">
            {ranked.map((entry, index) => (
              <li key={entry.record.id} className="rank-row">
                <span className="rank-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="rank-body">
                  <div className="rank-heading">
                    <Link to={`/investigations/${entry.record.id}`}>{entry.record.acronym}</Link>
                    <span className="rank-name">{entry.record.name}</span>
                    <span className="rank-score">{entry.breakdown.score.toFixed(1)}</span>
                  </div>
                  <div className="score-bar" aria-hidden="true">
                    <span style={{ width: `${entry.breakdown.score}%` }} />
                  </div>
                  <p className="why-line">{whyLine(entry.record, preset, weights)}</p>
                  <p className="small-note">
                    {coverageCount(entry.record)} of 6 inputs stated. Function{' '}
                    {entry.breakdown.function.toFixed(1)}, oxygen {entry.breakdown.oxygen.toFixed(1)},
                    gravity {entry.breakdown.gravity.toFixed(1)}, tier{' '}
                    {entry.breakdown.tier.toFixed(1)}, readiness{' '}
                    {entry.breakdown.readiness.toFixed(2)}.
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="share-section" aria-labelledby="share-title">
        <div>
          <h2 id="share-title">Share this ranking.</h2>
          <p className="small-note">
            The preset and weights travel in the URL. The same inputs give the same order every time.
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="btn" onClick={share}>
            Copy share link
          </button>
          <span className="form-message" role="status">
            {shareStatus}
          </span>
        </div>
      </section>

      <section aria-labelledby="matrix-title">
        <div className="section-heading">
          <h2 id="matrix-title">All presets, one matrix.</h2>
          <p className="section-note">
            Each cell is the score out of 100 for that record in that environment. Darker cells are
            higher scores.
          </p>
        </div>
        <div className="button-row left">
          <button type="button" className="btn" aria-pressed={showMatrix} onClick={() => setShowMatrix(!showMatrix)}>
            {showMatrix ? 'Hide matrix' : 'Show matrix'}
          </button>
        </div>
        {showMatrix ? (
          <div className="table-wrap">
            <table className="data-table matrix-table">
              <caption className="visually-hidden">Crew Fit scores by investigation and preset</caption>
              <thead>
                <tr>
                  <th scope="col">Record</th>
                  {presets.map((item) => (
                    <th key={item.id} scope="col">
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.record.id}>
                    <th scope="row">
                      <Link to={`/investigations/${row.record.id}`}>{row.record.acronym}</Link>
                    </th>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.preset.id}
                        className="matrix-cell"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--bone) ${Math.max(3, cell.score * 0.22)}%, var(--soot))`,
                        }}
                      >
                        {cell.score.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="small-note">The matrix is hidden to keep this page short. Show it when you need a cross-preset view.</p>
        )}
      </section>
    </Page>
  );
}
