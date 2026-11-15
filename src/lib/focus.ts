export const FOCUS_OPTIONS = ['all', 'flammability', 'detection', 'suppression'] as const;
export type Focus = (typeof FOCUS_OPTIONS)[number];

export const focusLabels: Record<Focus, string> = {
  all: 'All fire-safety areas',
  flammability: 'Flammability',
  detection: 'Detection',
  suppression: 'Suppression',
};

export function isFocus(value: string | null): value is Focus {
  return FOCUS_OPTIONS.includes((value ?? '') as Focus);
}
