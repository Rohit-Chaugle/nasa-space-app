import { inPsiRecords, investigations } from '../data/investigations';
import type { Investigation, InvestigationFunction } from '../data/schema';
import {
  EARTH_OXYGEN_PCT,
  EARTH_TOTAL_PRESSURE_PSI,
  MOON_OXYGEN_PCT,
  MOON_TOTAL_PRESSURE_PSI,
  SUIT_OXYGEN_PCT,
  SUIT_TOTAL_PRESSURE_PSI,
  earthOxygenPartialPressure,
  fixed,
  moonOxygenPartialPressure,
  oxygenPartialPressure,
  percentChange,
  signedPct,
  signedPsi,
  suitOxygenPartialPressure,
} from './atmosphere';
import { computeGaps, oxygenAbove30Records, partialGravityDataRecords, numericAirflowRecords, pressureStatedRecords } from './gaps';
import type { Focus } from './focus';
import { focusLabels } from './focus';
import { FACTOR_KEYS, breakdown, getPreset, normalizeWeights, rankByPreset, type PresetId, type Weights } from './scoring';

export type BriefEnvironmentId =
  | 'spacecraft'
  | 'station'
  | 'lunar'
  | 'martian'
  | 'rover'
  | 'suit'
  | 'earth'
  | 'custom';

export type BriefEnvironment = {
  id: BriefEnvironmentId;
  name: string;
  oxygenPct: number;
  pressurePsi: number;
  note: string;
  presetId: PresetId;
};

export const briefEnvironments: BriefEnvironment[] = [
  {
    id: 'spacecraft',
    name: 'Spacecraft cabin',
    oxygenPct: EARTH_OXYGEN_PCT,
    pressurePsi: EARTH_TOTAL_PRESSURE_PSI,
    note: 'Cabin atmosphere is not stated in the brief. The fields start at Earth sea level: 21% is a standard value, not from the brief; 14.7 psi is from the brief.',
    presetId: 'spacecraft',
  },
  {
    id: 'station',
    name: 'Space station',
    oxygenPct: EARTH_OXYGEN_PCT,
    pressurePsi: EARTH_TOTAL_PRESSURE_PSI,
    note: 'Station atmosphere is not stated in the brief. The fields start at Earth sea level: 21% is a standard value, not from the brief; 14.7 psi is from the brief.',
    presetId: 'station',
  },
  {
    id: 'lunar',
    name: 'Lunar base',
    oxygenPct: MOON_OXYGEN_PCT,
    pressurePsi: MOON_TOTAL_PRESSURE_PSI,
    note: 'The brief planning point is 30% oxygen or more at 10.2 psi or less.',
    presetId: 'lunar',
  },
  {
    id: 'martian',
    name: 'Martian base',
    oxygenPct: MOON_OXYGEN_PCT,
    pressurePsi: MOON_TOTAL_PRESSURE_PSI,
    note: 'Martian base atmosphere is not stated in the brief. The Moon planning point is shown as a starting point only.',
    presetId: 'martian',
  },
  {
    id: 'rover',
    name: 'Pressurized rover',
    oxygenPct: MOON_OXYGEN_PCT,
    pressurePsi: MOON_TOTAL_PRESSURE_PSI,
    note: 'Rover atmosphere is not stated in the brief. The Moon planning point is shown as a starting point only.',
    presetId: 'rover',
  },
  {
    id: 'suit',
    name: 'Spacesuit',
    oxygenPct: SUIT_OXYGEN_PCT,
    pressurePsi: SUIT_TOTAL_PRESSURE_PSI,
    note: 'The brief states 100% oxygen at 4.3 psi for the spacesuit.',
    presetId: 'spacecraft',
  },
  {
    id: 'earth',
    name: 'Earth sea level',
    oxygenPct: EARTH_OXYGEN_PCT,
    pressurePsi: EARTH_TOTAL_PRESSURE_PSI,
    note: '14.7 psi is from the brief. 21% oxygen is a standard value, not from the brief.',
    presetId: 'spacecraft',
  },
  {
    id: 'custom',
    name: 'Custom',
    oxygenPct: MOON_OXYGEN_PCT,
    pressurePsi: MOON_TOTAL_PRESSURE_PSI,
    note: 'Custom values are the user’s planning inputs. They are not archive measurements.',
    presetId: 'lunar',
  },
];

export type BriefInput = {
  environmentId: BriefEnvironmentId;
  oxygenPct: number;
  pressurePsi: number;
  focus: Focus;
};

export type SourceEntry = {
  key: string;
  label: string;
  url?: string;
};

export type BriefSentence = {
  text: string;
  noteKeys: string[];
};

export type BriefRecord = {
  rank: number;
  record: Investigation;
  score: number;
  reason: string;
  noteKeys: string[];
};

export type ScenarioBrief = {
  title: string;
  environment: BriefEnvironment;
  focus: Focus;
  oxygenPct: number;
  pressurePsi: number;
  partialPressure: number;
  scenario: BriefSentence[];
  atmosphere: BriefSentence[];
  records: BriefRecord[];
  notStated: string[];
  dataNeeds: string[];
  sources: SourceEntry[];
  footprint: string;
  markdown: string;
};

export function focusFunctions(focus: Focus): InvestigationFunction[] {
  if (focus === 'flammability') return ['flammability'];
  if (focus === 'detection') return ['detection', 'dust-detection'];
  if (focus === 'suppression') return ['suppression'];
  return [];
}

export function briefWeights(presetId: PresetId, focus: Focus): Weights {
  const preset = getPreset(presetId);
  if (focus === 'all') return preset.weights;
  return normalizeWeights({ ...preset.weights, function: preset.weights.function + 0.15 });
}

export function focusedPreset(presetId: PresetId, focus: Focus) {
  const preset = getPreset(presetId);
  if (focus === 'all') return preset;
  return { ...preset, primary: [...preset.primary, ...focusFunctions(focus)] };
}

export function topBriefRecords(
  records: Investigation[],
  presetId: PresetId,
  focus: Focus,
  count = 5,
): BriefRecord[] {
  const preset = focusedPreset(presetId, focus);
  const weights = briefWeights(presetId, focus);
  const ranked = rankByPreset(
    records.filter((record) => record.status === 'in_psi'),
    preset,
    weights,
  );
  return ranked.slice(0, count).map((entry, index) => {
    const gaps: string[] = [];
    if (entry.breakdown.function < 1) gaps.push(entry.breakdown.function > 0 ? 'secondary function' : 'not a focus function');
    if (entry.breakdown.oxygen < 1) gaps.push(entry.breakdown.oxygen === 0.2 ? 'oxygen not stated' : 'oxygen below 30%');
    if (entry.breakdown.gravity < 1) gaps.push(entry.breakdown.gravity > 0 ? 'gravity analog or bound' : 'gravity mismatch');
    if (entry.breakdown.tier < 1) gaps.push('related tier');
    if (entry.breakdown.readiness < 1) gaps.push(`${entry.breakdown.coverageCount} of 6 inputs stated`);
    return {
      rank: index + 1,
      record: entry.record,
      score: entry.breakdown.score,
      reason:
        gaps.length === 0
          ? 'All five factors are at full strength.'
          : `Held back by: ${gaps.join('; ')}.`,
      noteKeys: [`record:${entry.record.id}`],
    };
  });
}

function buildSources(records: Investigation[], extra: string[] = []): SourceEntry[] {
  const sources: SourceEntry[] = [
    {
      key: 'psi',
      label: 'NASA Physical Science Informatics (PSI) home page',
      url: 'https://psi.nasa.gov/',
    },
    {
      key: 'brief-atmosphere',
      label: 'Project brief, section 5: atmosphere formula and planning values',
    },
    {
      key: 'standard-21',
      label: 'Standard atmosphere value, not from the brief: 21% oxygen at Earth sea level',
    },
  ];
  for (const record of records) {
    sources.push({
      key: `record:${record.id}`,
      label: `${record.acronym}, ${record.source.section}; verification: ${record.source.verification.replace('_', ' ')}`,
      url: record.source.psi_url,
    });
  }
  for (const label of extra) {
    sources.push({ key: label, label });
  }
  return sources;
}

export function buildBrief(input: BriefInput): ScenarioBrief {
  const environment =
    briefEnvironments.find((item) => item.id === input.environmentId) ?? briefEnvironments[2]!;
  const oxygenPct = Math.min(100, Math.max(10, input.oxygenPct));
  const pressurePsi = Math.min(15, Math.max(4, input.pressurePsi));
  const partialPressure = oxygenPartialPressure(oxygenPct, pressurePsi);
  const pressureChange = percentChange(partialPressure, earthOxygenPartialPressure);
  const oxygenChange = percentChange(oxygenPct, EARTH_OXYGEN_PCT);
  const preset = focusedPreset(environment.presetId, input.focus);
  const weights = briefWeights(environment.presetId, input.focus);
  const records = topBriefRecords(inPsiRecords, environment.presetId, input.focus);
  const allSourceRecords = records.map((entry) => entry.record);
  const sources = buildSources(
    allSourceRecords,
    input.focus !== 'all' ? [`Focus rule: ${focusLabels[input.focus]} adds its function to the preset primary set and adds 0.15 to the Function weight before renormalization.`] : [],
  );
  const footnote = (keys: string[]) => keys;

  const title = `Crew fire safety brief: ${environment.name}, ${focusLabels[input.focus].toLowerCase()}`;
  const scenario: BriefSentence[] = [
    {
      text: `The planning atmosphere is ${oxygenPct}% oxygen at ${pressurePsi.toFixed(1)} psi total pressure, which gives an oxygen partial pressure of ${fixed(partialPressure)} psi (${oxygenPct}% × ${pressurePsi.toFixed(1)} psi).`,
      noteKeys: footnote(['brief-atmosphere']),
    },
    {
      text: `Against Earth sea level at ${fixed(earthOxygenPartialPressure)} psi, the partial pressure changes by ${signedPsi(partialPressure - earthOxygenPartialPressure)} (${signedPct(pressureChange)}), while the oxygen fraction changes by ${signedPct(oxygenChange)}.`,
      noteKeys: footnote(['brief-atmosphere', 'standard-21']),
    },
    {
      text: `The spacesuit point is ${fixed(suitOxygenPartialPressure)} psi, ${signedPsi(suitOxygenPartialPressure - earthOxygenPartialPressure)} against Earth, and the Moon planning point is ${fixed(moonOxygenPartialPressure)} psi.`,
      noteKeys: footnote(['brief-atmosphere']),
    },
  ];

  const atmosphere: BriefSentence[] = [
    {
      text: `Oxygen partial pressure = oxygen fraction × total pressure. At ${oxygenPct}% and ${pressurePsi.toFixed(1)} psi: ${oxygenPct}% × ${pressurePsi.toFixed(1)} psi = ${fixed(partialPressure)} psi.`,
      noteKeys: footnote(['brief-atmosphere']),
    },
    {
      text: `Earth comparison: (${fixed(partialPressure)} − ${fixed(earthOxygenPartialPressure)}) ÷ ${fixed(earthOxygenPartialPressure)} = ${signedPct(pressureChange)} in partial pressure; (${oxygenPct} − ${EARTH_OXYGEN_PCT}) ÷ ${EARTH_OXYGEN_PCT} = ${signedPct(oxygenChange)} in oxygen fraction.`,
      noteKeys: footnote(['brief-atmosphere', 'standard-21']),
    },
    {
      text: `The Moon planning point gives 30% × 10.2 psi = ${fixed(moonOxygenPartialPressure)} psi; the suit gives 100% × 4.3 psi = ${fixed(suitOxygenPartialPressure)} psi.`,
      noteKeys: footnote(['brief-atmosphere']),
    },
  ];

  const missing = new Set<string>();
  for (const entry of records) {
    if (!entry.record.readiness.oxygen.stated) missing.add('oxygen fraction');
    if (!entry.record.readiness.pressure.stated) missing.add('total pressure');
    if (!entry.record.readiness.airflow.stated) missing.add('numeric airflow');
    if (!entry.record.readiness.fuelGeometry.stated) missing.add('fuel geometry');
  }
  const gaps = computeGaps();
  const notStated = [
    `Partial-gravity combustion data records: ${partialGravityDataRecords().length}.`,
    `Records with a stated test pressure: ${pressureStatedRecords().length}.`,
    `Records with a numeric airflow: ${numericAirflowRecords().length}.`,
    `Records with stated oxygen above 30%: ${oxygenAbove30Records().length}.`,
    ...gaps.filter((gap) => gap.id === 'acme-named').map((gap) => `${gap.title}: ${gap.value}.`),
  ];

  const dataNeeds = [
    ...(missing.has('oxygen fraction') ? ['An oxygen fraction for each ranked record, so partial pressure can be computed.'] : []),
    ...(missing.has('total pressure') ? ['A total test pressure for each ranked record, in psi.'] : []),
    ...(missing.has('numeric airflow') ? ['A numeric airflow or ventilation boundary condition for each ranked record.'] : []),
    ...(missing.has('fuel geometry') ? ['The fuel geometry, so a flammability result can be tied to a material configuration.'] : []),
    `A partial-gravity experiment, because ${partialGravityDataRecords().length} records in the archive report partial-gravity data.`,
    'The three unnamed ACME experiments, if their work touches oxygen-enriched or partial-gravity fire safety.',
  ];

  const briefBase = {
    title,
    environment,
    focus: input.focus,
    oxygenPct,
    pressurePsi,
    partialPressure,
    scenario,
    atmosphere,
    records,
    notStated,
    dataNeeds,
    sources,
    footprint: `Ranked with ${preset.name} Crew Fit weights${input.focus === 'all' ? '' : ` and a ${focusLabels[input.focus].toLowerCase()} focus`}. Weight order: function ${(weights.function * 100).toFixed(1)}%, oxygen ${(weights.oxygen * 100).toFixed(1)}%, gravity ${(weights.gravity * 100).toFixed(1)}%, tier ${(weights.tier * 100).toFixed(1)}%, readiness ${(weights.readiness * 100).toFixed(1)}%.`,
  };
  return { ...briefBase, markdown: briefToMarkdown(briefBase) };
}

function noteNumber(sources: SourceEntry[], keys: string[]): string {
  return keys
    .map((key) => {
      const index = sources.findIndex((source) => source.key === key);
      return index >= 0 ? String(index + 1) : '?';
    })
    .join(',');
}

export function briefToMarkdown(brief: Omit<ScenarioBrief, 'markdown'> & { markdown?: string }): string {
  const lines: string[] = [];
  lines.push(`# ${brief.title}`, '');
  lines.push(`Environment: ${brief.environment.name}. Oxygen fraction: ${brief.oxygenPct}%. Total pressure: ${brief.pressurePsi.toFixed(1)} psi. Focus: ${focusLabels[brief.focus]}.`, '');
  lines.push('## Scenario and atmosphere', '');
  for (const sentence of brief.scenario) {
    lines.push(`${sentence.text} [${noteNumber(brief.sources, sentence.noteKeys)}]`, '');
  }
  lines.push('## Top five records', '');
  for (const entry of brief.records) {
    lines.push(`${entry.rank}. ${entry.record.acronym} - ${entry.record.name}. Score ${entry.score.toFixed(1)} / 100. ${entry.reason} [${noteNumber(brief.sources, entry.noteKeys)}]`, '');
  }
  lines.push('## What the archive does not state', '');
  for (const item of brief.notStated) lines.push(`- ${item}`);
  lines.push('', '## Data needs', '');
  for (const item of brief.dataNeeds) lines.push(`- ${item}`);
  lines.push('', '## Sources', '');
  brief.sources.forEach((source, index) => {
    lines.push(`${index + 1}. ${source.label}${source.url ? ` - ${source.url}` : ''}`);
  });
  lines.push('', `Ranking footprint: ${brief.footprint}`, '');
  lines.push('Generated in the browser by Ghostflame. The brief and NASA PSI metadata are the only sources.');
  return lines.join('\n');
}

export const briefFormulaFootnote =
  'Crew Fit score = 100 × sum(weight × factor). Focus adds 0.15 to Function weight and adds the focus function to the preset primary set; weights renormalize.';

export const briefConstants = {
  earthOxygenPartialPressure,
  moonOxygenPartialPressure,
  suitOxygenPartialPressure,
  EARTH_TOTAL_PRESSURE_PSI,
  EARTH_OXYGEN_PCT,
  SUIT_TOTAL_PRESSURE_PSI,
  SUIT_OXYGEN_PCT,
  MOON_TOTAL_PRESSURE_PSI,
  MOON_OXYGEN_PCT,
};

export const briefSourceCount = (brief: ScenarioBrief) => brief.sources.length;

export const factorOrder = FACTOR_KEYS;

export const scoreBreakdown = breakdown;

export const allRecords = investigations;

export const buildBriefNote = 'Deterministic template; identical inputs give identical output.';
