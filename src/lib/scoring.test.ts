import { describe, expect, it } from 'vitest';
import { inPsiRecords } from '../data/investigations';
import {
  breakdown,
  crewFitScore,
  getPreset,
  matrixScores,
  normalizeWeights,
  presets,
  rankByPreset,
  setNormalizedWeight,
  weightsSum,
  whyLine,
} from './scoring';

describe('Crew Fit scoring', () => {
  const lunar = getPreset('lunar');

  it('ranks CFI-G first and E-FIELD second for the Lunar base preset', () => {
    const ranked = rankByPreset(inPsiRecords, lunar);
    expect(ranked[0]?.record.id).toBe('cfi-g');
    expect(ranked[1]?.record.id).toBe('e-field');
  });

  it('keeps preset weights normalized', () => {
    for (const preset of presets) {
      expect(weightsSum(preset.weights)).toBeCloseTo(1, 10);
    }
  });

  it('renormalizes changed weights', () => {
    const changed = setNormalizedWeight(lunar.weights, 'oxygen', 0.5);
    expect(weightsSum(changed)).toBeCloseTo(1, 10);
    expect(changed.oxygen).toBeGreaterThan(lunar.weights.oxygen);
  });

  it('handles all-zero sliders deterministically', () => {
    const normalized = normalizeWeights({
      function: 0,
      oxygen: 0,
      gravity: 0,
      tier: 0,
      readiness: 0,
    });
    expect(normalized).toEqual({
      function: 0.2,
      oxygen: 0.2,
      gravity: 0.2,
      tier: 0.2,
      readiness: 0.2,
    });
  });

  it('computes the documented score formula', () => {
    const result = breakdown(inPsiRecords.find((record) => record.id === 'cfi-g')!, lunar);
    const manual =
      100 *
      (0.25 * 1 + 0.25 * 1 + 0.2 * 0.5 + 0.15 * 1 + 0.15 * (4 / 6));
    expect(result.score).toBeCloseTo(manual, 10);
    expect(crewFitScore(inPsiRecords.find((record) => record.id === 'cfi-g')!, lunar)).toBeCloseTo(
      manual,
      10,
    );
  });

  it('uses readiness then name as tie-breakers', () => {
    const ranked = rankByPreset(inPsiRecords, lunar);
    const first = ranked[0]!;
    const second = ranked[1]!;
    expect(first.breakdown.score).toBeGreaterThanOrEqual(second.breakdown.score);
    if (first.breakdown.score === second.breakdown.score) {
      expect(first.breakdown.coverageCount).toBeGreaterThanOrEqual(second.breakdown.coverageCount);
    }
  });

  it('generates an explanatory why line', () => {
    const eField = inPsiRecords.find((record) => record.id === 'e-field')!;
    expect(whyLine(eField, lunar, lunar.weights)).toContain('oxygen not stated');
  });

  it('produces matrix scores for every preset', () => {
    const matrix = matrixScores(inPsiRecords.slice(0, 3));
    expect(matrix).toHaveLength(3);
    expect(matrix[0]!.cells).toHaveLength(presets.length);
  });
});
