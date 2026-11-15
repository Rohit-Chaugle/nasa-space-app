import { describe, expect, it } from 'vitest';
import { searchArchive } from './search';

function ids(query: string) {
  return searchArchive(query).results.map((result) => result.record.id);
}

describe('Ask the Archive', () => {
  it('maps liquid fuel to FLEX, FLEX-2 and CFI', () => {
    const result = ids('liquid fuel');
    expect(result).toContain('flex');
    expect(result).toContain('flex-2');
    expect(result).toContain('cfi');
    expect(result).not.toContain('cfi-g');
  });

  it('puts SAME and SAME-R first for smoke detection', () => {
    const result = ids('smoke detection');
    expect(result.slice(0, 2).sort()).toEqual(['same', 'same-r']);
  });

  it('returns only CFI-G for above 30% oxygen', () => {
    expect(ids('above 30% oxygen')).toEqual(['cfi-g']);
  });

  it('puts E-FIELD first for partial gravity and lists planned records separately', () => {
    const search = searchArchive('partial gravity');
    expect(search.results[0]?.record.id).toBe('e-field');
    expect(search.results.map((result) => result.record.id)).not.toContain('luci');
    expect(search.planned.map((result) => result.record.id)).toEqual(
      expect.arrayContaining(['luci', 'fm2']),
    );
  });

  it('returns the solid records first for solid materials', () => {
    const result = ids('solid materials').slice(0, 5).sort();
    expect(result).toEqual(['bass', 'bass-ii', 'saffire-1', 'saffire-2', 'saffire-3']);
  });

  it('puts FLEX first for helium', () => {
    expect(ids('helium')[0]).toBe('flex');
  });

  it('maps droplet to liquid records', () => {
    const result = ids('droplet');
    expect(result).toEqual(expect.arrayContaining(['flex', 'flex-2', 'cfi']));
  });

  it('maps fabric and plastic to solid records', () => {
    expect(ids('fabric')).toContain('bass');
    expect(ids('plastic')).toContain('bass');
    expect(ids('plastic')).toContain('saffire-1');
  });

  it('maps alarm to detection records', () => {
    const result = ids('alarm');
    expect(result[0]).toBe('same');
    expect(result).toContain('same-r');
  });

  it('maps dust to DAFT', () => {
    const result = ids('dust');
    expect(result.slice(0, 2).sort()).toEqual(['daft', 'daft-2']);
  });

  it('maps moon and lunar to the partial-gravity analog', () => {
    expect(ids('moon')[0]).toBe('e-field');
    expect(ids('lunar')[0]).toBe('e-field');
  });

  it('maps free fall to microgravity records', () => {
    expect(ids('free fall')).toContain('bass');
    expect(ids('free fall')).not.toContain('e-field');
  });

  it('maps microgravity explicitly', () => {
    expect(ids('microgravity')).toContain('flex');
    expect(ids('microgravity')).not.toContain('e-field');
  });

  it('maps suppress to suppression records', () => {
    expect(ids('suppress')).toEqual(expect.arrayContaining(['flex', 'flex-2', 'bass']));
  });

  it('maps extinguish to suppression records', () => {
    expect(ids('extinguish')).toContain('flex');
  });

  it('maps CO2 to suppression records', () => {
    expect(ids('CO2')).toContain('flex');
  });

  it('maps gas to gas-phase records', () => {
    const result = ids('gas');
    expect(result).toContain('cfi-g');
    expect(result).toContain('bre');
  });

  it('accepts an above-30 variant', () => {
    expect(ids('oxygen above 30%')).toEqual(['cfi-g']);
  });

  it('returns a no-match state with suggestions for an unknown word', () => {
    const search = searchArchive('zzzz');
    expect(search.noMatch).toBe(true);
    expect(search.results).toHaveLength(0);
    expect(search.suggestions.length).toBeGreaterThanOrEqual(2);
  });

  it('is deterministic for identical input', () => {
    const first = searchArchive('solid materials');
    const second = searchArchive('solid materials');
    expect(first.results.map((result) => result.record.id)).toEqual(
      second.results.map((result) => result.record.id),
    );
    expect(first.results.map((result) => result.score)).toEqual(
      second.results.map((result) => result.score),
    );
  });

  it('honours removed concept chips', () => {
    const search = searchArchive('liquid fuel', ['liquid']);
    expect(search.concepts).toHaveLength(0);
  });

  it('shows an empty state for an empty query', () => {
    const search = searchArchive('');
    expect(search.results).toHaveLength(0);
    expect(search.noMatch).toBe(false);
  });
});
