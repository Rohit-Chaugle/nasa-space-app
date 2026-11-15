import { describe, expect, it } from 'vitest';
import { buildBrief, briefEnvironments, topBriefRecords } from './brief';

const moonBrief = buildBrief({
  environmentId: 'lunar',
  oxygenPct: 30,
  pressurePsi: 10.2,
  focus: 'all',
});

describe('Scenario Brief', () => {
  it('is deterministic for identical inputs', () => {
    const again = buildBrief({
      environmentId: 'lunar',
      oxygenPct: 30,
      pressurePsi: 10.2,
      focus: 'all',
    });
    expect(again.markdown).toBe(moonBrief.markdown);
    expect(again.records.map((entry) => entry.record.id)).toEqual(
      moonBrief.records.map((entry) => entry.record.id),
    );
  });

  it('defaults to the Moon planning point', () => {
    const lunar = briefEnvironments.find((environment) => environment.id === 'lunar')!;
    expect(lunar.oxygenPct).toBe(30);
    expect(lunar.pressurePsi).toBe(10.2);
  });

  it('contains five records and CFI-G first', () => {
    expect(moonBrief.records).toHaveLength(5);
    expect(moonBrief.records[0]?.record.id).toBe('cfi-g');
  });

  it('puts a footnote token on every data sentence', () => {
    for (const sentence of [...moonBrief.scenario, ...moonBrief.atmosphere]) {
      expect(sentence.noteKeys.length).toBeGreaterThan(0);
      expect(moonBrief.sources.some((source) => source.key === sentence.noteKeys[0])).toBe(true);
    }
    for (const entry of moonBrief.records) {
      expect(entry.noteKeys.length).toBeGreaterThan(0);
      expect(moonBrief.sources.some((source) => source.key === entry.noteKeys[0])).toBe(true);
    }
  });

  it('includes the computed atmosphere numbers in markdown', () => {
    expect(moonBrief.markdown).toContain('3.06 psi');
    expect(moonBrief.markdown).toContain('-1%');
    expect(moonBrief.markdown).toContain('+43%');
    expect(moonBrief.markdown).toContain('Top five records');
  });

  it('changes with focus', () => {
    const detection = topBriefRecords(
      buildBrief({
        environmentId: 'lunar',
        oxygenPct: 30,
        pressurePsi: 10.2,
        focus: 'detection',
      }).records.map((entry) => entry.record),
      'lunar',
      'detection',
    );
    expect(detection).toHaveLength(5);
  });
});
