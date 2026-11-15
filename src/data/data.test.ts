import { describe, expect, it } from 'vitest';
import raw from './investigations.json';
import { IDS, investigationsSchema } from './schema';
import { inPsiRecords, investigations, plannedRecords, relationshipGroups } from './investigations';

describe('investigation dataset', () => {
  it('validates with the zod schema', () => {
    expect(() => investigationsSchema.parse(raw)).not.toThrow();
  });

  it('has exactly the 19 named records', () => {
    expect(investigations).toHaveLength(19);
    expect(investigations.map((record) => record.id).sort()).toEqual([...IDS].sort());
  });

  it('has 17 PSI records and 2 planned records', () => {
    expect(inPsiRecords).toHaveLength(17);
    expect(plannedRecords).toHaveLength(2);
    expect(plannedRecords.map((record) => record.id).sort()).toEqual(['fm2', 'luci']);
  });

  it('marks every record verification as named_in_brief', () => {
    for (const record of investigations) {
      expect(record.source.verification).toBe('named_in_brief');
      expect(record.source.psi_url).toBe('https://psi.nasa.gov/');
    }
  });

  it('uses microgravity for every in-PSI record except E-FIELD', () => {
    for (const record of inPsiRecords) {
      expect(record.gravity).toBe(record.id === 'e-field' ? 'partial_analog' : 'microgravity');
    }
  });

  it('keeps the shared hardware groups intact', () => {
    expect(relationshipGroups.find((group) => group.id === 'mdca')?.ids).toEqual([
      'flex',
      'flex-2',
      'cfi',
    ]);
    expect(relationshipGroups.find((group) => group.id === 'acme')?.ids).toEqual([
      'cfi-g',
      'e-field',
      'bre',
    ]);
  });

  it('rejects a bad record at validation time', () => {
    const bad = structuredClone(raw) as Array<Record<string, unknown>>;
    bad[0]!.id = 'not-a-record';
    expect(() => investigationsSchema.parse(bad)).toThrow();
  });
});
