import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { exampleQueries, searchArchive, type ConceptKey } from '../lib/search';

export function AskPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [draft, setDraft] = useState(query);
  const [excluded, setExcluded] = useState<ConceptKey[]>([]);

  useEffect(() => {
    setDraft(query);
    setExcluded([]);
  }, [query]);

  const search = searchArchive(query, excluded);
  const hasQuery = query.trim().length > 0;

  const runQuery = (nextQuery: string) => {
    const next = new URLSearchParams(params);
    if (nextQuery.trim()) next.set('q', nextQuery);
    else next.delete('q');
    setParams(next, { replace: true });
  };

  return (
    <Page
      plate="05"
      title={
        <>
          Ask in plain words. See exactly what the archive <em className="hl-em">read</em>.
        </>
      }
      lede="A rules parser maps synonyms to filters, then TF-IDF ranks the remaining text. Every result carries a reason line. Nothing leaves your browser."
      wide
    >
      <section className="ask-panel" aria-labelledby="ask-title">
        <h2 id="ask-title" className="visually-hidden">
          Ask the archive
        </h2>
        <form
          className="ask-form"
          onSubmit={(event) => {
            event.preventDefault();
            runQuery(draft);
          }}
        >
          <label htmlFor="archive-query">Search the archive</label>
          <div className="ask-input-row">
            <input
              id="archive-query"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="For example: smoke detection or above 30% oxygen"
              autoComplete="off"
            />
            <button type="submit" className="btn primary">
              Ask
            </button>
          </div>
        </form>
        <div className="example-row" role="group" aria-label="Example queries">
          <span className="mono-label">Examples</span>
          {exampleQueries.map((example) => (
            <button
              key={example}
              type="button"
              className="example-chip"
              onClick={() => {
                setDraft(example);
                runQuery(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {!hasQuery ? (
        <div className="empty-state">
          <h2>Start with a word the brief uses.</h2>
          <p>
            Try a phase, a fire-safety job, a gas or a gravity level. The parser recognizes words such as
            liquid, smoke, dust, helium, lunar and microgravity. Unmatched words still guide the text
            similarity.
          </p>
        </div>
      ) : null}

      {hasQuery ? (
        <section className="read-as-section" aria-labelledby="read-as-title">
          <div className="section-heading compact">
            <h2 id="read-as-title">Read as</h2>
            <p className="section-note">Remove a chip to drop that filter and search again.</p>
          </div>
          <div className="chip-row">
            {search.concepts.length > 0 ? (
              search.concepts.map((concept) => (
                <span key={concept.key} className="read-chip">
                  {concept.label}
                  <button
                    type="button"
                    aria-label={`Remove ${concept.label} reading`}
                    onClick={() => setExcluded((current) => [...current, concept.key])}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="unknown">No filter words were recognized.</span>
            )}
            {search.unmatchedWords.length > 0 ? (
              <span className="small-note">
                Text similarity terms: {search.unmatchedWords.join(', ')}
              </span>
            ) : null}
          </div>
          {excluded.length > 0 ? (
            <button type="button" className="btn quiet" onClick={() => setExcluded([])}>
              Restore all readings
            </button>
          ) : null}
        </section>
      ) : null}

      {search.noMatch ? (
        <div className="empty-state">
          <h2>Nothing in the archive matched that reading.</h2>
          <p>
            Understood:{' '}
            {search.understood.length > 0 ? search.understood.join(', ') : 'no filter words'}. Text
            terms:{' '}
            {search.unmatchedWords.length > 0 ? search.unmatchedWords.join(', ') : 'none'}. Try one of
            these working queries:
          </p>
          <div className="button-row">
            {search.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="btn"
                onClick={() => {
                  setDraft(suggestion);
                  runQuery(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {hasQuery && !search.noMatch ? (
        <section aria-labelledby="results-title">
          <div className="section-heading">
            <h2 id="results-title">Ranked results.</h2>
            <p className="section-note">
              {search.results.length} ranked {search.results.length === 1 ? 'record' : 'records'}.
              Rule matches come first, then text similarity.
            </p>
          </div>
          {search.results.length > 0 ? (
            <ol className="result-list">
              {search.results.map((result, index) => (
                <li key={result.record.id} className="result-row">
                  <span className="rank-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>
                      <Link to={`/investigations/${result.record.id}`}>{result.record.acronym}</Link>{' '}
                      <span className="result-name">{result.record.name}</span>
                    </h3>
                    <p>{result.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="unknown">No in-PSI records matched this reading.</p>
          )}

          {search.planned.length > 0 ? (
            <div className="planned-block">
              <h3>Planned records, not ranked</h3>
              <p className="small-note">
                These records match the reading but have no PSI data yet. They never receive a score.
              </p>
              <ul className="plain-list">
                {search.planned.map((result) => (
                  <li key={result.record.id}>
                    <Link to={`/investigations/${result.record.id}`}>{result.record.acronym}</Link>:{' '}
                    {result.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="formula-section" aria-labelledby="ask-method-title">
        <h2 id="ask-method-title">What just happened.</h2>
        <ol className="method-list">
          <li>Synonym phrases become removable filters. The table is fixed in the source code.</li>
          <li>Records that match at least one filter are ranked by the number of matched concepts.</li>
          <li>
            Unmatched words and the full query produce a TF-IDF cosine similarity score. The same
            query always gives the same order.
          </li>
          <li>
            Ties break on direct tier, readiness, then name. Planned records are listed separately and
            never ranked.
          </li>
        </ol>
      </section>
    </Page>
  );
}
