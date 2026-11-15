import { inPsiRecords, investigations, plannedRecords } from '../data/investigations';
import { coverageCount } from './coverage';

export type Gap = {
  id: string;
  title: string;
  value: string;
  why: string;
  href: string;
  hrefLabel: string;
};

export const ACME_TOTAL = 6;

export function acmeNamedRecords() {
  return investigations.filter((record) => record.hardware.includes('ACME'));
}

export function oxygenAbove30Records() {
  return investigations.filter(
    (record) => record.oxygen_pct_max !== null && record.oxygen_pct_max > 30,
  );
}

export function pressureStatedRecords() {
  return inPsiRecords.filter((record) => record.readiness.pressure.stated);
}

export function numericAirflowRecords() {
  return inPsiRecords.filter((record) => record.readiness.airflow.stated);
}

export function partialGravityDataRecords() {
  return inPsiRecords.filter((record) => record.gravity === 'partial');
}

export function computeGaps(): Gap[] {
  const partial = partialGravityDataRecords().length;
  const acme = acmeNamedRecords().length;
  const oxygen = oxygenAbove30Records().length;
  const pressure = pressureStatedRecords().length;
  const airflow = numericAirflowRecords().length;
  return [
    {
      id: 'partial-gravity-data',
      title: 'Partial-gravity combustion data present',
      value: String(partial),
      why: 'Lunar and Martian bases sit in partial gravity, but the archive holds microgravity and an electric-field analog, not partial-gravity combustion data.',
      href: '#/atmosphere',
      hrefLabel: 'Atmosphere Lab',
    },
    {
      id: 'planned-records',
      title: 'Planned records',
      value: String(plannedRecords.length),
      why: 'LUCI and FM2 would address the gap, but the brief says they have no PSI data yet, so they cannot support a ranking.',
      href: '#/gaps',
      hrefLabel: 'This page',
    },
    {
      id: 'acme-named',
      title: 'ACME experiments named in the brief',
      value: `${acme} of ${ACME_TOTAL}`,
      why: 'Three of six ACME experiments are named. The other three could matter, but the brief supplies no names or records for them.',
      href: '#/method',
      hrefLabel: 'Method',
    },
    {
      id: 'oxygen-above-30',
      title: 'Records with stated oxygen above 30%',
      value: String(oxygen),
      why: 'The Moon planning point is 30% oxygen or more. Only one record states an oxygen level in that range.',
      href: '#/atmosphere',
      hrefLabel: 'Atmosphere Lab',
    },
    {
      id: 'test-pressure',
      title: 'Records with a stated test pressure',
      value: String(pressure),
      why: 'Without total pressure, a flammability result cannot be converted into an oxygen partial pressure for a crew cabin.',
      href: '#/data',
      hrefLabel: 'Data Room',
    },
    {
      id: 'numeric-airflow',
      title: 'Records with a numeric airflow',
      value: String(airflow),
      why: 'Ventilation moves oxygen to a flame and smoke to a detector. A qualitative flow duct does not give a model a boundary condition.',
      href: '#/data',
      hrefLabel: 'Data Room',
    },
  ];
}

export function readinessCoverageByRecord() {
  return inPsiRecords.map((record) => ({ record, count: coverageCount(record) }));
}
