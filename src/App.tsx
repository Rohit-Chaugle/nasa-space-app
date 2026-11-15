import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ArchiveProvider } from './context/ArchiveContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Tour } from './components/Tour';
import { RouteErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { AtlasPage } from './pages/AtlasPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { CrewFitPage } from './pages/CrewFitPage';
import { AtmospherePage } from './pages/AtmospherePage';
import { AskPage } from './pages/AskPage';
import { ComparePage } from './pages/ComparePage';
import { ControlsPage } from './pages/ControlsPage';
import { DataPage } from './pages/DataPage';
import { BriefPage } from './pages/BriefPage';
import { EarthPage } from './pages/EarthPage';
import { GapsPage } from './pages/GapsPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { MethodPage } from './pages/MethodPage';
import { JudgesPage } from './pages/JudgesPage';
import { NotFoundPage } from './pages/NotFoundPage';

const titles: Array<[RegExp, string]> = [
  [/^\/$/, 'Ghostflame | Combustion evidence for crew fire safety'],
  [/^\/atlas/, 'Atlas | Ghostflame'],
  [/^\/investigations\//, 'Investigation | Ghostflame'],
  [/^\/crew-fit/, 'Crew Fit | Ghostflame'],
  [/^\/atmosphere/, 'Atmosphere Lab | Ghostflame'],
  [/^\/ask/, 'Ask the Archive | Ghostflame'],
  [/^\/compare/, 'Compare | Ghostflame'],
  [/^\/controls/, 'Controls | Ghostflame'],
  [/^\/data/, 'Data Room | Ghostflame'],
  [/^\/brief/, 'Scenario Brief | Ghostflame'],
  [/^\/earth/, 'Earth applications | Ghostflame'],
  [/^\/gaps/, 'Gaps | Ghostflame'],
  [/^\/glossary/, 'Glossary | Ghostflame'],
  [/^\/method/, 'Method | Ghostflame'],
  [/^\/judges/, 'For Judges | Ghostflame'],
];

export default function App() {
  const location = useLocation();
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    const match = titles.find(([pattern]) => pattern.test(location.pathname));
    document.title = match?.[1] ?? 'Page not found | Ghostflame';
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ArchiveProvider>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Header
        onTour={() => {
          setTourStep(0);
          setTourOpen(true);
        }}
      />
      <main id="main" className="site-main">
        <RouteErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/investigations/:id" element={<InvestigationPage />} />
            <Route path="/crew-fit" element={<CrewFitPage />} />
            <Route path="/atmosphere" element={<AtmospherePage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/controls" element={<ControlsPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/brief" element={<BriefPage />} />
            <Route path="/earth" element={<EarthPage />} />
            <Route path="/gaps" element={<GapsPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/method" element={<MethodPage />} />
            <Route path="/judges" element={<JudgesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RouteErrorBoundary>
      </main>
      <Footer />
      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        step={tourStep}
        setStep={setTourStep}
      />
    </ArchiveProvider>
  );
}
