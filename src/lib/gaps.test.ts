import { describe, expect, it } from 'vitest';
import {
  ACME_TOTAL,
  acmeNamedRecords,
  computeGaps,
  numericAirflowRecords,
  oxygenAbove30Records,
  partialGravityDataRecords,
  pressureStatedRecords,
} from './gaps';

describe('computed gaps', () => {
  it('computes the six gap counts from the dataset', () => {
    expect(partialGravityDataRecords()).toHaveLength(0);
    expect(acmeNamedRecords()).toHaveLength(3);
    expect(ACME_TOTAL).toBe(6);
    expect(oxygenAbove30Records()).toHaveLength(1);
    expect(pressureStatedRecords()).toHaveLength(0);
    expect(numericAirflowRecords()).toHaveLength(0);
  });

  it('returns every gap with a crew consequence and a link', () => {
    const gaps = computeGaps();
    expect(gaps).toHaveLength(6);
    for (const gap of gaps) {
      expect(gap.why.length).toBeGreaterThan(20);
      expect(gap.href.startsWith('#/')).toBe(true);
      expect(gap.hrefLabel.length).toBeGreaterThan(0);
    }
  });

  it('states 3 of 6 ACME experiments', () => {
    const gap = computeGaps().find((item) => item.id === 'acme-named');
    expect(gap?.value).toBe('3 of 6');
  });
});
