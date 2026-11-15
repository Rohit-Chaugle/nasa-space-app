import { Page } from '../components/Page';
import { InvestigationCard } from '../components/InvestigationCard';
import { investigations } from '../data/investigations';
import type { InvestigationFunction } from '../data/schema';

type Column = {
  id: string;
  title: string;
  description: string;
  functions: InvestigationFunction[];
  question: string;
};

const columns: Column[] = [
  {
    id: 'prevention',
    title: 'Prevention',
    description:
      'The brief names flammability work across solids, liquids and gases, plus an oxygen-enriched experiment. These records describe what burns and under which material conditions. They do not state a test pressure or a numeric airflow.',
    functions: ['flammability', 'oxygen-enriched'],
    question: 'If a lunar habitat runs at 30% oxygen and 10.2 psi, which material sample should a new test use first?',
  },
  {
    id: 'detection',
    title: 'Detection',
    description:
      'SAME and SAME-R test fire detection in microgravity. DAFT and DAFT-2 reuse one SAME smoke-detection instrument to test dust detection. The brief does not state how either instrument performs.',
    functions: ['detection', 'dust-detection'],
    question: 'Would the SAME instrument separate dust from smoke in a rover with weak airflow?',
  },
  {
    id: 'suppression',
    title: 'Suppression',
    description:
      'FLEX studies suppression by diluting the atmosphere with CO2 and helium. FLEX-2 is known from its name as a suppression experiment. BASS and BASS-II also include suppression in their descriptions.',
    functions: ['suppression'],
    question: 'Does helium dilution behave the same way in partial gravity as it does in microgravity?',
  },
  {
    id: 'fundamentals',
    title: 'Fundamentals and gravity',
    description:
      'SPICE and SLICE study flame fundamentals, smoke point, structure and liftoff. CFI and CFI-G study cool flames. E-FIELD uses an electric field to mimic partial gravity, but the brief says it is an analog, not partial-gravity data.',
    functions: ['flame-fundamentals', 'partial-gravity'],
    question: 'Can the E-FIELD analog stand in for missing partial-gravity data in a predictive model?',
  },
];

export function ControlsPage() {
  return (
    <Page
      plate="06"
      title={
        <>
          Four control questions, with the evidence the brief <em className="hl-em">names</em>.
        </>
      }
      lede="Prevention, detection, suppression, and the fundamentals that sit under them. Open questions are our suggestions for the next test, not findings from the archive."
      wide
    >
      <div className="controls-grid">
        {columns.map((column) => {
          const records = investigations.filter((record) =>
            record.functions.some((fn) => column.functions.includes(fn)),
          );
          return (
            <section key={column.id} className="control-column" aria-labelledby={`control-${column.id}`}>
              <div className="control-head">
                <span className="mono-label">{String(records.length).padStart(2, '0')} records</span>
                <h2 id={`control-${column.id}`}>{column.title}</h2>
                <p>{column.description}</p>
              </div>
              <div className="control-cards">
                {records.map((record) => (
                  <InvestigationCard key={record.id} record={record} />
                ))}
              </div>
              <div className="open-question">
                <span className="mono-label">Open question</span>
                <p>{column.question}</p>
                <p className="small-note">Our suggestion, not a finding.</p>
              </div>
            </section>
          );
        })}
      </div>
      <p className="small-note">
        Every record appears in at least one column. Several appear in more than one because the brief
        assigns more than one function to them. Planned records are labeled and never ranked.
      </p>
    </Page>
  );
}
