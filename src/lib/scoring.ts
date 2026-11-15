import { coverageFraction, coverageCount } from './coverage';
import type { Gravity, Investigation, InvestigationFunction } from '../data/schema';

export const FACTOR_KEYS = ['function', 'oxygen', 'gravity', 'tier', 'readiness'] as const;
export type FactorKey = (typeof FACTOR_KEYS)[number];
export type Weights = Record<FactorKey, number>;

export type PresetId = 'spacecraft' | 'station' | 'lunar' | 'martian' | 'rover';
export type EnvironmentGravity = Extract<Gravity, 'microgravity' | 'partial'>;

export type Preset = {
  id: PresetId;
  name: string;
  sentence: string;
  primary: InvestigationFunction[];
  secondary: InvestigationFunction[];
  gravity: EnvironmentGravity;
  weights: Weights;
};

export const factorLabels: Record<FactorKey, string> = {
  function: 'Function',
  oxygen: 'Oxygen',
  gravity: 'Gravity',
  tier: 'Tier',
  readiness: 'Readiness',
};

export const presets: Preset[] = [
  {
    id: 'spacecraft',
    name: 'Spacecraft cabin',
    sentence: 'A sealed cabin where fabrics, plastics and electronics are the likely fuels.',
    primary: ['flammability'],
    secondary: ['detection', 'suppression'],
    gravity: 'microgravity',
    weights: { function: 0.3, oxygen: 0.1, gravity: 0.25, tier: 0.2, readiness: 0.15 },
  },
  {
    id: 'station',
    name: 'Space station',
    sentence: 'A long-duration orbital habitat where detection and suppression must work without gravity.',
    primary: ['detection', 'suppression'],
    secondary: ['flammability'],
    gravity: 'microgravity',
    weights: { function: 0.25, oxygen: 0.1, gravity: 0.2, tier: 0.25, readiness: 0.2 },
  },
  {
    id: 'lunar',
    name: 'Lunar base',
    sentence: 'A surface habitat planned around 30% oxygen or more at 10.2 psi or less.',
    primary: ['oxygen-enriched', 'partial-gravity', 'flammability'],
    secondary: ['suppression', 'detection'],
    gravity: 'partial',
    weights: { function: 0.25, oxygen: 0.25, gravity: 0.2, tier: 0.15, readiness: 0.15 },
  },
  {
    id: 'martian',
    name: 'Martian base',
    sentence: 'A surface base where partial gravity and enriched oxygen both shape fire risk.',
    primary: ['partial-gravity', 'flammability'],
    secondary: ['oxygen-enriched', 'suppression', 'detection'],
    gravity: 'partial',
    weights: { function: 0.25, oxygen: 0.15, gravity: 0.25, tier: 0.15, readiness: 0.2 },
  },
  {
    id: 'rover',
    name: 'Pressurized rover',
    sentence: 'A small, moving pressure vessel where enriched oxygen demands both prevention and suppression.',
    primary: ['oxygen-enriched', 'flammability', 'suppression'],
    secondary: ['detection'],
    gravity: 'partial',
    weights: { function: 0.25, oxygen: 0.25, gravity: 0.15, tier: 0.15, readiness: 0.2 },
  },
];

export function getPreset(id: string): Preset {
  return presets.find((preset) => preset.id === id) ?? presets[0]!;
}

export function normalizeWeights(weights: Weights): Weights {
  const total = FACTOR_KEYS.reduce((sum, key) => sum + Math.max(0, weights[key]), 0);
  if (total <= 0) {
    return { function: 0.2, oxygen: 0.2, gravity: 0.2, tier: 0.2, readiness: 0.2 };
  }
  return FACTOR_KEYS.reduce(
    (result, key) => {
      result[key] = Math.max(0, weights[key]) / total;
      return result;
    },
    {} as Weights,
  );
}

export function weightsSum(weights: Weights): number {
  return FACTOR_KEYS.reduce((sum, key) => sum + weights[key], 0);
}

export function setNormalizedWeight(weights: Weights, key: FactorKey, value: number): Weights {
  return normalizeWeights({ ...weights, [key]: value });
}

export function functionFactor(record: Investigation, preset: Preset): number {
  if (record.functions.some((fn) => preset.primary.includes(fn))) return 1;
  if (record.functions.some((fn) => preset.secondary.includes(fn))) return 0.5;
  return 0;
}

export function oxygenFactor(record: Investigation): number {
  if (record.oxygen_pct_max === null) {
    return record.readiness.oxygen.stated ? 0.5 : 0.2;
  }
  return record.oxygen_pct_max >= 30 ? 1 : 0.5;
}

export const GRAVITY_ANALOG_NOTE =
  'A surface preset counts the partial-gravity analog as a gravity match; the record still says it is an analog, not partial-gravity data.';

export function gravityFactor(record: Investigation, preset: Preset): number {
  if (record.gravity === preset.gravity) return 1;
  if (preset.gravity === 'partial' && record.gravity === 'partial_analog') return 1;
  if (preset.gravity === 'partial' && record.gravity === 'microgravity') return 0.5;
  if (preset.gravity === 'microgravity' && record.gravity === 'partial_analog') return 0.5;
  return 0;
}

export function tierFactor(record: Investigation): number {
  return record.tier === 'direct' ? 1 : record.tier === 'related' ? 0.4 : 0;
}

export type ScoreBreakdown = Record<FactorKey, number> & {
  score: number;
  coverage: number;
  coverageCount: number;
  weights: Weights;
};

export function breakdown(record: Investigation, preset: Preset, inputWeights = preset.weights): ScoreBreakdown {
  const weights = normalizeWeights(inputWeights);
  const factors: Record<FactorKey, number> = {
    function: functionFactor(record, preset),
    oxygen: oxygenFactor(record),
    gravity: gravityFactor(record, preset),
    tier: tierFactor(record),
    readiness: coverageFraction(record),
  };
  const weighted = FACTOR_KEYS.reduce((sum, key) => sum + weights[key] * factors[key], 0);
  return {
    ...factors,
    score: 100 * weighted,
    coverage: factors.readiness,
    coverageCount: coverageCount(record),
    weights,
  };
}

export function crewFitScore(
  record: Investigation,
  preset: Preset,
  weights: Weights = preset.weights,
): number {
  return breakdown(record, preset, weights).score;
}

export function compareNames(a: Investigation, b: Investigation): number {
  const left = a.name.toLowerCase();
  const right = b.name.toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function rankByPreset(
  records: Investigation[],
  preset: Preset,
  weights: Weights = preset.weights,
): Array<{ record: Investigation; breakdown: ScoreBreakdown }> {
  return records
    .map((record) => ({ record, breakdown: breakdown(record, preset, weights) }))
    .sort((a, b) => {
      if (b.breakdown.score !== a.breakdown.score) return b.breakdown.score - a.breakdown.score;
      if (b.breakdown.coverageCount !== a.breakdown.coverageCount) {
        return b.breakdown.coverageCount - a.breakdown.coverageCount;
      }
      return compareNames(a.record, b.record);
    });
}

export function whyLine(record: Investigation, preset: Preset, weights: Weights): string {
  const parts: string[] = [];
  const result = breakdown(record, preset, weights);
  if (result.function < 1) {
    parts.push(result.function > 0 ? 'secondary function' : 'not a preset function');
  }
  if (result.oxygen < 1) {
    parts.push(result.oxygen === 0.2 ? 'oxygen not stated' : 'oxygen below 30%');
  }
  if (result.gravity < 1) {
    parts.push(result.gravity > 0 ? 'gravity analog or bound' : 'gravity mismatch');
  }
  if (result.tier < 1) parts.push('related tier');
  if (result.readiness < 1) parts.push(`${result.coverageCount} of 6 inputs stated`);
  if (parts.length === 0) return 'All five factors are at full strength.';
  return `Held back by: ${parts.join('; ')}.`;
}

export function matrixScores(records: Investigation[]): Array<{
  record: Investigation;
  cells: Array<{ preset: Preset; score: number }>;
}> {
  return records.map((record) => ({
    record,
    cells: presets.map((preset) => ({ preset, score: crewFitScore(record, preset) })),
  }));
}
