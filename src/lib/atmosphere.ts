export const EARTH_TOTAL_PRESSURE_PSI = 14.7;
export const EARTH_OXYGEN_PCT = 21;
export const SUIT_TOTAL_PRESSURE_PSI = 4.3;
export const SUIT_OXYGEN_PCT = 100;
export const MOON_TOTAL_PRESSURE_PSI = 10.2;
export const MOON_OXYGEN_PCT = 30;

export const oxygenPartialPressure = (oxygenPct: number, totalPressurePsi: number): number =>
  (oxygenPct / 100) * totalPressurePsi;

export const earthOxygenPartialPressure = oxygenPartialPressure(
  EARTH_OXYGEN_PCT,
  EARTH_TOTAL_PRESSURE_PSI,
);
export const moonOxygenPartialPressure = oxygenPartialPressure(
  MOON_OXYGEN_PCT,
  MOON_TOTAL_PRESSURE_PSI,
);
export const suitOxygenPartialPressure = oxygenPartialPressure(
  SUIT_OXYGEN_PCT,
  SUIT_TOTAL_PRESSURE_PSI,
);

export const percentChange = (value: number, baseline: number): number =>
  ((value - baseline) / baseline) * 100;

export const moonVsEarthPressurePct = percentChange(
  moonOxygenPartialPressure,
  earthOxygenPartialPressure,
);
export const moonVsEarthOxygenPct = percentChange(MOON_OXYGEN_PCT, EARTH_OXYGEN_PCT);
export const suitVsEarthPressurePct = percentChange(
  suitOxygenPartialPressure,
  earthOxygenPartialPressure,
);

export const round = (value: number, places = 2): number => {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const fixed = (value: number, places = 2): string => value.toFixed(places);

export const signedPct = (value: number): string => {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
};

export const signedPsi = (value: number): string => {
  const rounded = round(value, 2);
  return `${rounded >= 0 ? '+' : ''}${rounded.toFixed(2)} psi`;
};

export const ATMOSPHERE_NOTES = {
  earthPressure: '14.7 psi is stated in the brief.',
  earthOxygen: '21% oxygen is a standard value, not from the brief.',
  suit: '100% oxygen at 4.3 psi is stated in the brief.',
  moon: '30% oxygen or more at 10.2 psi or less is the brief planning point.',
} as const;
