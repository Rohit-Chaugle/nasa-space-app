import { describe, expect, it } from 'vitest';
import {
  EARTH_OXYGEN_PCT,
  EARTH_TOTAL_PRESSURE_PSI,
  MOON_OXYGEN_PCT,
  MOON_TOTAL_PRESSURE_PSI,
  SUIT_TOTAL_PRESSURE_PSI,
  earthOxygenPartialPressure,
  moonOxygenPartialPressure,
  moonVsEarthOxygenPct,
  moonVsEarthPressurePct,
  oxygenPartialPressure,
  percentChange,
  round,
  signedPct,
  suitOxygenPartialPressure,
  suitVsEarthPressurePct,
} from './atmosphere';

describe('atmosphere formulas', () => {
  it('computes Earth sea level oxygen partial pressure', () => {
    expect(oxygenPartialPressure(21, 14.7)).toBeCloseTo(3.087, 5);
    expect(EARTH_OXYGEN_PCT).toBe(21);
    expect(EARTH_TOTAL_PRESSURE_PSI).toBe(14.7);
    expect(round(earthOxygenPartialPressure)).toBe(3.09);
  });

  it('computes the Moon planning point', () => {
    expect(oxygenPartialPressure(30, 10.2)).toBeCloseTo(3.06, 5);
    expect(round(moonOxygenPartialPressure)).toBe(3.06);
    expect(MOON_OXYGEN_PCT).toBe(30);
    expect(MOON_TOTAL_PRESSURE_PSI).toBe(10.2);
  });

  it('shows the two Moon changes against Earth can disagree', () => {
    expect(moonVsEarthPressurePct).toBeCloseTo(-0.8746, 3);
    expect(signedPct(moonVsEarthPressurePct)).toBe('-1%');
    expect(moonVsEarthOxygenPct).toBeCloseTo(42.857, 3);
    expect(signedPct(moonVsEarthOxygenPct)).toBe('+43%');
  });

  it('computes the spacesuit point and its change', () => {
    expect(oxygenPartialPressure(100, 4.3)).toBeCloseTo(4.3, 5);
    expect(round(suitOxygenPartialPressure)).toBe(4.3);
    expect(SUIT_TOTAL_PRESSURE_PSI).toBe(4.3);
    expect(suitVsEarthPressurePct).toBeCloseTo(39.2938, 3);
    expect(signedPct(suitVsEarthPressurePct)).toBe('+39%');
  });

  it('uses a general percent change formula', () => {
    expect(percentChange(3.06, 3.087)).toBeLessThan(0);
    expect(percentChange(30, 21)).toBeGreaterThan(0);
  });
});
