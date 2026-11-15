import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import {
  briefEnvironments,
  buildBrief,
  briefFormulaFootnote,
  type BriefEnvironmentId,
} from '../lib/brief';
import { FOCUS_OPTIONS, focusLabels, isFocus, type Focus } from '../lib/focus';
import { useArchive } from '../context/ArchiveContext';
import { copyText } from '../lib/export';
import { getInvestigation } from '../data/investigations';

function noteNumbers(keys: string[], sources: Array<{ key: string }>): string {
  return keys
    .map((key) => {
      const index = sources.findIndex((source) => source.key === key);
      return index >= 0 ? String(index + 1) : '';
    })
    .filter(Boolean)
    .join(',');
}

export function BriefPage() {
  const [params, setParams] = useSearchParams();
  const {
    pins,
    removePin,
    clearPins,
  } = useArchive();
  const [copyStatus, setCopyStatus] = useState('');

  const environmentId = (params.get('env') ?? 'lunar') as BriefEnvironmentId;
  const environment =
    briefEnvironments.find((item) => item.id === environmentId) ?? briefEnvironments[2]!;
  const oxygenPct = Number(params.get('o') ?? environment.oxygenPct);
  const pressurePsi = Number(params.get('p') ?? environment.pressurePsi);
  const focusParam = params.get('focus');
  const focus: Focus = isFocus(focusParam) ? focusParam : 'all';

  const brief = buildBrief({
    environmentId: environment.id,
    oxygenPct: Number.isFinite(oxygenPct) ? oxygenPct : environment.oxygenPct,
    pressurePsi: Number.isFinite(pressurePsi) ? pressurePsi : environment.pressurePsi,
    focus,
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const chooseEnvironment = (id: BriefEnvironmentId) => {
    const nextEnvironment = briefEnvironments.find((item) => item.id === id);
    if (!nextEnvironment) return;
    const next = new URLSearchParams(params);
    next.set('env', id);
    next.set('o', String(nextEnvironment.oxygenPct));
    next.set('p', String(nextEnvironment.pressurePsi));
    setParams(next, { replace: true });
  };

  const copyMarkdown = async () => {
    try {
      await copyText(brief.markdown);
      setCopyStatus('Markdown copied.');
    } catch {
      setCopyStatus('Copy failed. Use the print view or select the text.');
    }
  };

  return (
    <Page
      plate="08"
      title={
        <>
          A scenario brief that shows its <em className="hl-em">sources</em>.
        </>
      }
      lede="Set an environment, atmosphere and focus. The brief ranks five records from the archive, states what is missing, and prints cleanly from the browser."
      wide
      className="brief-page"
    >
      <section className="brief-form no-print" aria-labelledby="brief-form-title">
        <div className="section-heading compact">
          <h2 id="brief-form-title">Inputs</h2>
          <p className="section-note">Identical inputs produce identical output.</p>
        </div>
        <div className="form-grid">
          <label>
            <span className="mono-label">Environment preset</span>
            <select
              value={environment.id}
              onChange={(event) => chooseEnvironment(event.target.value as BriefEnvironmentId)}
            >
              {briefEnvironments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono-label">Focus</span>
            <select value={focus} onChange={(event) => setParam('focus', event.target.value)}>
              {FOCUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {focusLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="slider-row brief-slider">
            <span className="mono-label">Oxygen fraction</span>
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={brief.oxygenPct}
              onChange={(event) => setParam('o', event.target.value)}
              aria-valuetext={`${brief.oxygenPct} percent`}
            />
            <output>{brief.oxygenPct}%</output>
          </label>
          <label className="slider-row brief-slider">
            <span className="mono-label">Total pressure</span>
            <input
              type="range"
              min={4}
              max={15}
              step={0.1}
              value={brief.pressurePsi}
              onChange={(event) => setParam('p', event.target.value)}
              aria-valuetext={`${brief.pressurePsi.toFixed(1)} psi`}
            />
            <output>{brief.pressurePsi.toFixed(1)} psi</output>
          </label>
        </div>
        <p className="small-note">{environment.note}</p>
        <div className="button-row">
          <button type="button" className="btn primary" onClick={() => window.print()}>
            Print or save as PDF
          </button>
          <button type="button" className="btn" onClick={copyMarkdown}>
            Copy as Markdown
          </button>
          <span className="form-message" role="status">
            {copyStatus}
          </span>
        </div>
      </section>

      <div className="pinned-block no-print">
        <div className="section-heading compact">
          <h2>Records pinned for review</h2>
          <p className="section-note">
            Pins do not change the ranking. They are a shortlist you assembled from record pages.
          </p>
        </div>
        {pins.length === 0 ? (
          <p className="small-note">
            No records pinned. Open an investigation and choose Add to Scenario Brief.
          </p>
        ) : (
          <>
            <ul className="pin-list">
              {pins.map((id) => {
                const record = getInvestigation(id);
                if (!record) return null;
                return (
                  <li key={id}>
                    <Link to={`/investigations/${id}`}>{record.acronym}</Link>
                    <span>{record.name}</span>
                    <button type="button" className="text-button" onClick={() => removePin(id)}>
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="btn quiet" onClick={clearPins}>
              Clear pins
            </button>
          </>
        )}
      </div>

      <article className="brief-output" aria-labelledby="brief-title">
        <header className="brief-head">
          <p className="mono-label">Ghostflame scenario brief</p>
          <h2 id="brief-title">{brief.title}</h2>
          <p className="small-note">
            Environment: {environment.name}. Focus: {focusLabels[focus]}. Generated in the browser
            from brief metadata and NASA PSI record descriptions. Not a PSI analysis and not a test
            result.
          </p>
        </header>

        <section aria-labelledby="brief-scenario-title">
          <h3 id="brief-scenario-title">Scenario and atmosphere</h3>
          {brief.scenario.map((sentence) => (
            <p key={sentence.text} className="brief-sentence">
              {sentence.text}
              <sup className="footnote">[{noteNumbers(sentence.noteKeys, brief.sources)}]</sup>
            </p>
          ))}
        </section>

        <section aria-labelledby="brief-atmosphere-title">
          <h3 id="brief-atmosphere-title">Atmosphere arithmetic</h3>
          {brief.atmosphere.map((sentence) => (
            <p key={sentence.text} className="brief-sentence">
              {sentence.text}
              <sup className="footnote">[{noteNumbers(sentence.noteKeys, brief.sources)}]</sup>
            </p>
          ))}
          <p className="small-note">{briefFormulaFootnote}</p>
        </section>

        <section aria-labelledby="brief-records-title">
          <h3 id="brief-records-title">Top five records</h3>
          <ol className="brief-records">
            {brief.records.map((entry) => (
              <li key={entry.record.id}>
                <div className="brief-record-head">
                  <span className="brief-rank">{entry.rank}</span>
                  <div>
                    <Link to={`/investigations/${entry.record.id}`}>{entry.record.acronym}</Link>
                    <span className="result-name"> {entry.record.name}</span>
                  </div>
                  <span className="brief-score">{entry.score.toFixed(1)} / 100</span>
                </div>
                <p>
                  {entry.reason}
                  <sup className="footnote">[{noteNumbers(entry.noteKeys, brief.sources)}]</sup>
                </p>
              </li>
            ))}
          </ol>
          <p className="small-note">{brief.footprint}</p>
        </section>

        <div className="brief-two-col">
          <section aria-labelledby="brief-not-stated-title">
            <h3 id="brief-not-stated-title">What the archive does not state</h3>
            <ul className="plain-list">
              {brief.notStated.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="brief-needs-title">
            <h3 id="brief-needs-title">Rule-based data needs</h3>
            <ul className="plain-list">
              {brief.dataNeeds.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="brief-sources-title">
          <h3 id="brief-sources-title">Sources</h3>
          <ol className="source-numbered">
            {brief.sources.map((source) => (
              <li key={source.key}>
                {source.label}
                {source.url ? (
                  <>
                    {' '}
                    <a href={source.url} rel="noreferrer">
                      {source.url}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <footer className="brief-footer">
          <p>
            Team Targaryen. Built for the NASA Space Apps Challenge. Sources are the challenge brief
            and NASA PSI metadata. No raw sensor data is included.
          </p>
          <p className="small-note">{brief.environment.note}</p>
        </footer>
      </article>
    </Page>
  );
}
