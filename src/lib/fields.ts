import {
  functionLabels,
  gravityLabels,
  phaseLabels,
  readinessLabels,
  readinessKeys,
  tierLabels,
  type ReadinessKey,
} from '../data/investigations';
import type { Investigation } from '../data/schema';

export type DataColumn = {
  key: string;
  label: string;
  unit: string;
  definition: string;
  source: string;
  readiness?: ReadinessKey;
  stated?: boolean;
};

const briefSource = 'Project brief, section 4 (Data)';
const readinessSource = 'Project brief, section 4 (Data); readiness input';

export const baseColumns: DataColumn[] = [
  { key: 'id', label: 'Record ID', unit: 'text', definition: 'Stable identifier used by the site.', source: briefSource },
  { key: 'name', label: 'Name', unit: 'text', definition: 'Investigation name as given in the brief.', source: briefSource },
  { key: 'acronym', label: 'Acronym', unit: 'text', definition: 'Short name used in charts and tables.', source: briefSource },
  { key: 'status', label: 'Status', unit: 'text', definition: 'In PSI or planned. Planned records are not ranked.', source: briefSource },
  { key: 'tier', label: 'Tier', unit: 'text', definition: 'Direct, related or planned relevance as given in the brief.', source: briefSource },
  { key: 'gravity', label: 'Gravity', unit: 'text', definition: 'Microgravity, partial-gravity analog or planned partial gravity.', source: briefSource },
  { key: 'phases', label: 'Phase', unit: 'text', definition: 'Fuel phase tags derived from the brief description.', source: briefSource },
  { key: 'functions', label: 'Functions', unit: 'text', definition: 'Fire-safety function tags used by the filters and controls columns.', source: 'Derived from the brief description' },
  { key: 'fuel', label: 'Fuel', unit: 'text', definition: 'Fuel description as given in the brief.', source: briefSource },
  { key: 'hardware', label: 'Hardware', unit: 'text', definition: 'Hardware or facility named in the brief.', source: briefSource },
  { key: 'conditions', label: 'Conditions and function', unit: 'text', definition: 'Test condition or purpose as given in the brief.', source: briefSource },
  { key: 'objective', label: 'Objective', unit: 'text', definition: 'Plain-language paraphrase, 35 words or fewer, limited to brief facts.', source: 'Paraphrase of the brief' },
  { key: 'variables', label: 'Variables', unit: 'text', definition: 'Variables the brief names; blank when none are named.', source: briefSource },
  { key: 'measurements', label: 'Measurements', unit: 'text', definition: 'Measurements the brief names; blank when none are named.', source: briefSource },
];

export const readinessColumns: DataColumn[] = readinessKeys.flatMap((key) => [
  {
    key,
    label: readinessLabels[key],
    unit: key === 'pressure' ? 'psi' : key === 'oxygen' ? '%' : 'text',
    definition: `Readiness input: ${readinessLabels[key].toLowerCase()}. The value column repeats brief wording or says not stated in brief.`,
    source: readinessSource,
    readiness: key,
  },
  {
    key: `${key}_stated`,
    label: `${readinessLabels[key]} stated`,
    unit: 'boolean',
    definition: `Whether the brief states ${readinessLabels[key].toLowerCase()}. Used by coverage and Crew Fit.`,
    source: 'Computed from the readiness value',
    readiness: key,
    stated: true,
  },
]);

export const sourceColumns: DataColumn[] = [
  { key: 'oxygen_pct_max', label: 'Oxygen level', unit: '%', definition: 'Highest stated oxygen level, or blank when not stated.', source: briefSource },
  { key: 'source_section', label: 'Brief section', unit: 'text', definition: 'Section of the challenge brief that names the record.', source: briefSource },
  { key: 'psi_url', label: 'PSI URL', unit: 'URL', definition: 'NASA PSI home page address confirmed by the team.', source: 'Team-confirmed PSI home page' },
  { key: 'verification', label: 'Verification', unit: 'text', definition: 'Verification status. Every record is named in the brief.', source: briefSource },
];

export const allColumns: DataColumn[] = [...baseColumns, ...readinessColumns, ...sourceColumns];

export function columnValue(record: Investigation, column: DataColumn): string {
  if (column.readiness) {
    if (column.stated) return record.readiness[column.readiness].stated ? 'true' : 'false';
    return record.readiness[column.readiness].value;
  }
  switch (column.key) {
    case 'id':
      return record.id;
    case 'name':
      return record.name;
    case 'acronym':
      return record.acronym;
    case 'status':
      return record.status;
    case 'tier':
      return tierLabels[record.tier];
    case 'gravity':
      return gravityLabels[record.gravity];
    case 'phases':
      return record.phases.map((phase) => phaseLabels[phase]).join('; ');
    case 'functions':
      return record.functions.map((fn) => functionLabels[fn]).join('; ');
    case 'fuel':
      return record.fuel;
    case 'hardware':
      return record.hardware;
    case 'conditions':
      return record.conditions;
    case 'objective':
      return record.objective;
    case 'variables':
      return record.variables.join('; ');
    case 'measurements':
      return record.measurements.join('; ');
    case 'oxygen_pct_max':
      return record.oxygen_pct_max === null ? '' : String(record.oxygen_pct_max);
    case 'source_section':
      return record.source.section;
    case 'psi_url':
      return record.source.psi_url;
    case 'verification':
      return record.source.verification;
    default:
      return '';
  }
}

export function dataDictionaryMarkdown(): string {
  const lines = [
    '# Data dictionary',
    '',
    'Ghostflame carries metadata from the challenge brief and NASA PSI, not raw sensor data. A blank value means the brief names no value. The Data Room shows "not stated in brief" in the interface.',
    '',
    '| Field | Name | Unit | Definition | Source |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const column of allColumns) {
    lines.push(
      `| \`${column.key}\` | ${column.label} | ${column.unit} | ${column.definition} | ${column.source} |`,
    );
  }
  lines.push(
    '',
    'Readiness coverage = number of the six readiness inputs marked stated.',
    '',
    'Crew Fit score = 100 × sum(weight × factor) over Function, Oxygen, Gravity, Tier and Readiness.',
  );
  return lines.join('\n');
}
