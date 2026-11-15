import { describe, expect, it } from 'vitest';
import { inPsiRecords } from '../data/investigations';
import { allColumns, columnValue, dataDictionaryMarkdown } from './fields';
import { csvEscape, recordsToCsv } from './export';

describe('data dictionary and CSV', () => {
  it('gives every CSV header a dictionary entry', () => {
    const dictionary = dataDictionaryMarkdown();
    for (const column of allColumns) {
      expect(dictionary).toContain(`\`${column.key}\``);
      expect(dictionary).toContain(column.unit);
      expect(column.definition.length).toBeGreaterThan(5);
      expect(column.source.length).toBeGreaterThan(5);
    }
  });

  it('keeps CSV columns consistent with loaded records', () => {
    const csv = recordsToCsv(inPsiRecords.slice(0, 2));
    const header = csv.split(/\r?\n/)[0]!.split(',');
    expect(header).toHaveLength(allColumns.length);
    expect(header[0]).toBe('id');
    expect(header).toContain('oxygen_stated');
    expect(header).toContain('verification');
  });

  it('escapes commas and quotes', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('a"b')).toBe('"a""b"');
  });

  it('exports not stated in brief for unknown values', () => {
    const record = inPsiRecords.find((item) => item.id === 'same')!;
    const oxygenColumn = allColumns.find((column) => column.key === 'oxygen')!;
    expect(columnValue(record, oxygenColumn)).toBe('not stated in brief');
  });
});
