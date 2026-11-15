import { readinessKeys, readinessLabels, type ReadinessKey } from '../data/investigations';
import type { Investigation } from '../data/schema';

export type CoverageItem = {
  key: ReadinessKey;
  label: string;
  stated: boolean;
  value: string;
};

export function coverage(record: Investigation): CoverageItem[] {
  return readinessKeys.map((key) => ({
    key,
    label: readinessLabels[key],
    stated: record.readiness[key].stated,
    value: record.readiness[key].value,
  }));
}

export function coverageCount(record: Investigation): number {
  return readinessKeys.filter((key) => record.readiness[key].stated).length;
}

export function coverageFraction(record: Investigation): number {
  return coverageCount(record) / readinessKeys.length;
}

export function coverageLine(record: Investigation): string {
  const count = coverageCount(record);
  return `${count} of ${readinessKeys.length} inputs stated`;
}
