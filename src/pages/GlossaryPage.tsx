import { useState } from 'react';
import { Page } from '../components/Page';
import { glossary } from '../data/glossary';

export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const filtered = glossary.filter((entry) => {
    const text = `${entry.term} ${entry.definition}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <Page
      plate="12"
      title={
        <>
          The words a fire-safety <em className="hl-em">engineer</em> would ask about.
        </>
      }
      lede="Search plain definitions for the terms used in the Atlas, Crew Fit, Atmosphere Lab and Scenario Brief. Terms elsewhere on the site show the same definition on hover or focus."
      wide
    >
      <div className="glossary-search">
        <label htmlFor="glossary-query">Search definitions</label>
        <input
          id="glossary-query"
          type="search"
          value={query}
          placeholder="Try partial pressure or smoke point"
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="mono-label" aria-live="polite">
          {filtered.length} of {glossary.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>No term matches that search.</h2>
          <p>Clear the field to return to all definitions.</p>
          <button type="button" className="btn" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      ) : (
        <dl className="glossary-list">
          {filtered.map((entry) => (
            <div key={entry.term} className="glossary-entry">
              <dt>{entry.term}</dt>
              <dd>{entry.definition}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="small-note">
        Definitions are written for this project. They are not quotations from NASA. The brief supplies
        the experiment names and the atmosphere points; the general definitions are background.
      </p>
    </Page>
  );
}
