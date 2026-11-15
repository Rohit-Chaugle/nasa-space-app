import type { ReactNode } from 'react';
import { glossaryMap } from '../data/glossary';

export function Term({ children, term }: { children: ReactNode; term?: string }) {
  const label = term ?? (typeof children === 'string' ? children : '');
  const definition = glossaryMap.get(label.toLowerCase());
  if (!definition) return <>{children}</>;
  return (
    <span
      className="term"
      tabIndex={0}
      role="note"
      aria-label={`${label}: ${definition}`}
      data-definition={definition}
    >
      {children}
    </span>
  );
}
