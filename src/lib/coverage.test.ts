import { describe, expect, it } from 'vitest';
import { inPsiRecords } from '../data/investigations';
import { coverage, coverageCount, coverageFraction, coverageLine } from './coverage';

describe('readiness coverage', () => {
  it('counts the six stated inputs for CFI-G', () => {
    const record = inPsiRecords.find((item) => item.id === 'cfi-g')!;
    expect(coverageCount(record)).toBe(4);
    expect(coverageFraction(record)).toBeCloseTo(4 / 6, 10);
    expect(coverageLine(record)).toBe('4 of 6 inputs stated');
  });

  it('returns six labelled items per record', () => {
    const record = inPsiRecords[0]!;
    const items = coverage(record);
    expect(items).toHaveLength(6);
    expect(items.map((item) => item.key)).toEqual([
      'oxygen',
      'pressure',
      'airflow',
      'fuelIdentity',
      'fuelGeometry',
      'measurement',
    ]);
  });

  it('gives planned records zero coverage', () => {
    expect(coverageCount(inPsiRecords.find((item) => item.id === 'bass')!)).toBe(2);
  });
});
