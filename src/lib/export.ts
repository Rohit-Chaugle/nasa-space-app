import type { Investigation } from '../data/schema';
import { allColumns, columnValue, type DataColumn } from './fields';

export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function recordsToCsv(records: Investigation[], columns: DataColumn[] = allColumns): string {
  const header = columns.map((column) => csvEscape(column.key)).join(',');
  const rows = records.map((record) =>
    columns.map((column) => csvEscape(columnValue(record, column))).join(','),
  );
  return [header, ...rows].join('\r\n');
}

export function recordsToJson(records: Investigation[]): string {
  return JSON.stringify(records, null, 2);
}

export function downloadText(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, records: Investigation[], columns: DataColumn[]): void {
  downloadText(filename, recordsToCsv(records, columns), 'text/csv;charset=utf-8');
}

export function downloadJson(filename: string, records: Investigation[]): void {
  downloadText(filename, recordsToJson(records), 'application/json;charset=utf-8');
}

export function downloadMarkdown(filename: string, markdown: string): void {
  downloadText(filename, markdown, 'text/markdown;charset=utf-8');
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const done = document.execCommand('copy');
  area.remove();
  return done ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
}

export const compareColumns: DataColumn[] = allColumns.filter((column) =>
  [
    'acronym',
    'name',
    'tier',
    'gravity',
    'fuel',
    'hardware',
    'conditions',
    'variables',
    'measurements',
    'oxygen',
    'oxygen_stated',
    'pressure',
    'pressure_stated',
    'airflow',
    'airflow_stated',
    'fuelIdentity',
    'fuelGeometry',
    'measurement',
    'verification',
  ].includes(column.key),
);
