import raw from './investigations.json';
import { investigationsSchema, type Investigation } from './schema';

export const investigations: Investigation[] = investigationsSchema.parse(raw);
export const inPsiRecords = investigations.filter((record) => record.status === 'in_psi');
export const plannedRecords = investigations.filter((record) => record.status === 'planned');
export const namedInBriefRecords = investigations;

export function getInvestigation(id: string): Investigation | undefined {
  return investigations.find((record) => record.id === id);
}

export const readinessKeys = [
  'oxygen',
  'pressure',
  'airflow',
  'fuelIdentity',
  'fuelGeometry',
  'measurement',
] as const;

export type ReadinessKey = (typeof readinessKeys)[number];

export const readinessLabels: Record<ReadinessKey, string> = {
  oxygen: 'Oxygen fraction',
  pressure: 'Total pressure',
  airflow: 'Airflow',
  fuelIdentity: 'Fuel identity',
  fuelGeometry: 'Fuel geometry',
  measurement: 'Measurement',
};

export const phaseLabels = {
  solid: 'Solid',
  liquid: 'Liquid',
  gas: 'Gas',
  dust: 'Dust',
} as const;

export const functionLabels = {
  flammability: 'Flammability',
  detection: 'Detection',
  suppression: 'Suppression',
  'oxygen-enriched': 'Oxygen-enriched',
  'partial-gravity': 'Partial gravity',
  'dust-detection': 'Dust detection',
  'flame-fundamentals': 'Flame fundamentals',
} as const;

export const gravityLabels = {
  microgravity: 'Microgravity',
  partial_analog: 'Partial-gravity analog',
  partial: 'Partial gravity (planned)',
} as const;

export const tierLabels = {
  direct: 'Direct',
  related: 'Related',
  planned: 'Planned',
} as const;

export const relationshipGroups = [
  {
    id: 'mdca',
    label: 'MDCA in the CIR',
    note: 'FLEX, FLEX-2 and CFI share the MDCA in the CIR.',
    ids: ['flex', 'flex-2', 'cfi'],
  },
  {
    id: 'acme',
    label: 'ACME',
    note: 'CFI-G, E-FIELD and BRE are ACME experiments.',
    ids: ['cfi-g', 'e-field', 'bre'],
  },
  {
    id: 'msg',
    label: 'MSG and flow duct',
    note: 'BASS, BASS-II, SPICE and SLICE share the MSG and the flow duct built for SPICE.',
    ids: ['bass', 'bass-ii', 'spice', 'slice'],
  },
  {
    id: 'same-instrument',
    label: 'SAME detection instrument',
    note: 'SAME and DAFT share one smoke-detection instrument.',
    ids: ['same', 'same-r', 'daft', 'daft-2'],
  },
] as const;

export function relationshipsFor(id: string) {
  return relationshipGroups
    .filter((group) => (group.ids as readonly string[]).includes(id))
    .map((group) => ({
      ...group,
      others: group.ids.filter((other) => other !== id),
    }));
}

export const notStated = 'not stated in brief';
