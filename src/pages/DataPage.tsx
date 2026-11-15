import { useState } from 'react';
import { Page } from '../components/Page';
import { inPsiRecords, readinessKeys, readinessLabels, type ReadinessKey } from '../data/investigations';
import { allColumns, baseColumns, columnValue, dataDictionaryMarkdown, readinessColumns, sourceColumns } from '../lib/fields';
import { downloadCsv, downloadJson, downloadMarkdown } from '../lib/export';

export function DataPage() {
  const [selectedRecords, setSelectedRecords] = useState<string[]>(inPsiRecords.map((record) => record.id));
  const [selectedInputs, setSelectedInputs] = useState<ReadinessKey[]>([...readinessKeys]);
  const [status, setStatus] = useState('');
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

  const records = inPsiRecords.filter((record) => selectedRecords.includes(record.id));
  const columns = [
    ...baseColumns,
    ...readinessColumns.filter((column) => column.readiness && selectedInputs.includes(column.readiness)),
    ...sourceColumns,
  ];

  const toggleRecord = (id: string) => {
    setSelectedRecords((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleInput = (key: ReadinessKey) => {
    setSelectedInputs((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const exportCsv = () => {
    if (records.length === 0) {
      setStatus('Select at least one record before exporting.');
      return;
    }
    downloadCsv('ghostflame-data.csv', records, columns);
    setStatus(`CSV downloaded with ${records.length} records and ${columns.length} columns.`);
  };

  const exportJson = () => {
    if (records.length === 0) {
      setStatus('Select at least one record before exporting.');
      return;
    }
    downloadJson('ghostflame-data.json', records);
    setStatus(`JSON downloaded with ${records.length} records.`);
  };

  return (
    <Page
      plate="07"
      title={
        <>
          Metadata you can take out, with its <em className="hl-em">limits</em> attached.
        </>
      }
      lede="Choose records and model inputs. Preview the table, then export CSV or JSON. This room holds brief metadata, not raw sensor data."
      wide
    >
      <section aria-labelledby="data-records-title">
        <div className="section-heading compact">
          <h2 id="data-records-title">Records</h2>
          <p className="section-note">
            {records.length} of {inPsiRecords.length} selected. Planned records are not included because they
            have no PSI data.
          </p>
        </div>
        <div className="check-grid">
          {inPsiRecords.map((record) => (
            <label key={record.id} className="check-row">
              <input
                type="checkbox"
                checked={selectedRecords.includes(record.id)}
                onChange={() => toggleRecord(record.id)}
              />
              <span>{record.acronym}</span>
            </label>
          ))}
        </div>
        <div className="button-row">
          <button
            type="button"
            className="btn quiet"
            onClick={() => setSelectedRecords(inPsiRecords.map((record) => record.id))}
          >
            Select all
          </button>
          <button type="button" className="btn quiet" onClick={() => setSelectedRecords([])}>
            Select none
          </button>
        </div>
      </section>

      <section aria-labelledby="data-inputs-title">
        <div className="section-heading compact">
          <h2 id="data-inputs-title">Model inputs</h2>
          <p className="section-note">
            The six readiness inputs are shared by Crew Fit and this room. Add or remove their columns.
          </p>
        </div>
        <div className="check-grid six">
          {readinessKeys.map((key) => (
            <label key={key} className="check-row">
              <input
                type="checkbox"
                checked={selectedInputs.includes(key)}
                onChange={() => toggleInput(key)}
              />
              <span>{readinessLabels[key]}</span>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="preview-title">
        <div className="section-heading">
          <h2 id="preview-title">Preview and export.</h2>
          <p className="section-note">
            CSV and JSON are built in the browser from the selected records. No request is sent.
            The preview scrolls sideways to show every column.
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="btn primary" onClick={exportCsv}>
            Export CSV
          </button>
          <button type="button" className="btn" onClick={exportJson}>
            Export JSON
          </button>
          <button
            type="button"
            className="btn quiet"
            onClick={() => {
              downloadMarkdown('ghostflame-data-dictionary.md', dataDictionaryMarkdown());
              setStatus('Data dictionary Markdown downloaded.');
            }}
          >
            Download dictionary
          </button>
          <span className="form-message" role="status">
            {status}
          </span>
        </div>
        {records.length > 0 ? (
          <div
            className="table-wrap preview-table"
            role="region"
            aria-label="Selected records and inputs"
            tabIndex={0}
          >
            <table className="data-table">
              <caption className="visually-hidden">Selected records and inputs</caption>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {columns.map((column) => {
                      const value = columnValue(record, column);
                      return (
                        <td key={column.key} className={value === 'not stated in brief' ? 'unknown' : ''}>
                          {value === '' ? 'not stated in brief' : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h2>No records selected.</h2>
            <p>Select at least one record above to preview and export.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="heatmap-title">
        <div className="section-heading">
          <h2 id="heatmap-title">Readiness heatmap.</h2>
          <p className="section-note">
            Each cell says stated or not stated. The count at the right is the coverage used by Crew Fit.
          </p>
        </div>
        <div className="table-wrap">
          <table className="data-table heatmap-table">
            <caption className="visually-hidden">Readiness inputs by record</caption>
            <thead>
              <tr>
                <th scope="col">Record</th>
                {readinessKeys.map((key) => (
                  <th key={key} scope="col">
                    {readinessLabels[key]}
                  </th>
                ))}
                <th scope="col">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {inPsiRecords.map((record) => {
                const count = readinessKeys.filter((key) => record.readiness[key].stated).length;
                return (
                  <tr key={record.id}>
                    <th scope="row">{record.acronym}</th>
                    {readinessKeys.map((key) => (
                      <td
                        key={key}
                        className={record.readiness[key].stated ? 'heat-stated' : 'heat-unstated'}
                      >
                        {record.readiness[key].stated ? 'stated' : 'not stated'}
                      </td>
                    ))}
                    <td className="num">{count} of 6</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="summary-box" aria-labelledby="data-meaning-title">
        <h2 id="data-meaning-title">What this data is.</h2>
        <p>
          This is metadata from the challenge brief and NASA PSI record descriptions: names, hardware,
          brief conditions, and whether six readiness inputs are stated. It is not raw sensor data and
          it contains no test results. Raw data lives in PSI. The exports can seed a model, but a model
          that needs pressure, airflow or partial-gravity measurements will find those fields missing.
        </p>
        <p>
          <a href="https://psi.nasa.gov/" rel="noreferrer">
            Open NASA PSI
          </a>
        </p>
      </section>

      <section aria-labelledby="dictionary-title">
        <div className="section-heading compact">
          <h2 id="dictionary-title">Data dictionary, in Markdown.</h2>
          <p className="section-note">
            Every export field has a name, unit, definition and source. The same text is in the
            downloadable .md file.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          aria-expanded={dictionaryOpen}
          onClick={() => setDictionaryOpen(!dictionaryOpen)}
        >
          {dictionaryOpen ? 'Hide dictionary' : 'Show dictionary'}
        </button>
        {dictionaryOpen ? (
          <pre className="markdown-block">{dataDictionaryMarkdown()}</pre>
        ) : (
          <p className="small-note">
            {allColumns.length} fields documented. Open the dictionary to read the full table.
          </p>
        )}
      </section>
    </Page>
  );
}
