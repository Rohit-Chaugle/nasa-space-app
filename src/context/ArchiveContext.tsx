import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const COMPARE_KEY = 'ghostflame.compare';
const PINS_KEY = 'ghostflame.pins';
export const COMPARE_LIMIT = 4;
export const PIN_LIMIT = 5;

function readList(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    void 0;
  }
}

type ArchiveContextValue = {
  compare: string[];
  addCompare: (id: string) => boolean;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  isCompared: (id: string) => boolean;
  pins: string[];
  addPin: (id: string) => boolean;
  removePin: (id: string) => void;
  clearPins: () => void;
  isPinned: (id: string) => boolean;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [compare, setCompare] = useState<string[]>(() => readList(COMPARE_KEY));
  const [pins, setPins] = useState<string[]>(() => readList(PINS_KEY));

  useEffect(() => {
    writeList(COMPARE_KEY, compare);
  }, [compare]);

  useEffect(() => {
    writeList(PINS_KEY, pins);
  }, [pins]);

  const addCompare = useCallback((id: string) => {
    let added = false;
    setCompare((current) => {
      if (current.includes(id) || current.length >= COMPARE_LIMIT) return current;
      added = true;
      return [...current, id];
    });
    return added;
  }, []);

  const removeCompare = useCallback((id: string) => {
    setCompare((current) => current.filter((item) => item !== id));
  }, []);

  const clearCompare = useCallback(() => setCompare([]), []);

  const addPin = useCallback((id: string) => {
    let added = false;
    setPins((current) => {
      if (current.includes(id) || current.length >= PIN_LIMIT) return current;
      added = true;
      return [...current, id];
    });
    return added;
  }, []);

  const removePin = useCallback((id: string) => {
    setPins((current) => current.filter((item) => item !== id));
  }, []);

  const clearPins = useCallback(() => setPins([]), []);

  const value = useMemo<ArchiveContextValue>(
    () => ({
      compare,
      addCompare,
      removeCompare,
      clearCompare,
      isCompared: (id: string) => compare.includes(id),
      pins,
      addPin,
      removePin,
      clearPins,
      isPinned: (id: string) => pins.includes(id),
    }),
    [compare, pins, addCompare, removeCompare, clearCompare, addPin, removePin, clearPins],
  );

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive(): ArchiveContextValue {
  const context = useContext(ArchiveContext);
  if (!context) throw new Error('useArchive must be used inside ArchiveProvider');
  return context;
}
