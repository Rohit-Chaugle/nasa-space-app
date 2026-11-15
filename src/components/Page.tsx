import type { ReactNode } from 'react';

type PageProps = {
  plate: string;
  title: ReactNode;
  lede: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
};

export function Page({ plate, title, lede, children, wide = false, className = '' }: PageProps) {
  return (
    <div className={`page ${wide ? 'page-wide' : ''} ${className}`.trim()}>
      <aside className="rail" aria-hidden="true">
        <span className="plate-number">Plate {plate}</span>
        <span className="rail-rule" />
        <span className="rail-meta">Ghostflame</span>
      </aside>
      <div className="page-main">
        <header className="page-head">
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
        </header>
        {children}
      </div>
    </div>
  );
}
