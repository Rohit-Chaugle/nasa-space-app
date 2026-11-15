import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';

const navItems = [
  { to: '/atlas', label: 'Atlas' },
  { to: '/crew-fit', label: 'Crew Fit' },
  { to: '/atmosphere', label: 'Atmosphere' },
  { to: '/ask', label: 'Ask' },
  { to: '/controls', label: 'Controls' },
  { to: '/data', label: 'Data' },
  { to: '/brief', label: 'Brief' },
];

const moreItems = [
  { to: '/compare', label: 'Compare' },
  { to: '/earth', label: 'Earth' },
  { to: '/gaps', label: 'Gaps' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/method', label: 'Method' },
  { to: '/judges', label: 'For Judges' },
];

export function Header({ onTour }: { onTour: () => void }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Ghostflame home">
          <Logo size={30} />
          <span>Ghostflame</span>
        </Link>
        <nav className="main-nav" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
          <details className="more-menu">
            <summary className="nav-link">More</summary>
            <div className="more-panel">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </details>
        </nav>
        <button type="button" className="tour-button" onClick={onTour}>
          Guided tour
        </button>
      </div>
    </header>
  );
}
