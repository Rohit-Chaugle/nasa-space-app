import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const tourSteps = [
  {
    title: 'The flame',
    href: '/',
    text: 'Start on the home page. Switch between the Earth teardrop and the free-fall sphere. The caption explains why oxygen reaches the flame differently.',
  },
  {
    title: 'Atlas, filtered to liquid',
    href: '/atlas?phase=liquid&view=cards',
    text: 'The Atlas keeps filters in the URL. This view is filtered to liquid-fuel records. Notice FLEX, FLEX-2 and CFI.',
  },
  {
    title: 'Crew Fit, Lunar base',
    href: '/crew-fit?preset=lunar',
    text: 'Crew Fit weights five factors. With the Lunar base preset and default weights, CFI-G ranks first and E-FIELD ranks second.',
  },
  {
    title: 'Atmosphere Lab at 30% and 10.2 psi',
    href: '/atmosphere?o=30&p=10.2',
    text: 'At 30% oxygen and 10.2 psi, partial pressure is 3.06 psi. That is -1% against Earth, while the oxygen fraction is +43%.',
  },
  {
    title: 'Ask above 30% oxygen',
    href: '/ask?q=above+30%25+oxygen',
    text: 'The rules parser turns the phrase into an oxygen filter. CFI-G is the only record with stated oxygen above 30%.',
  },
  {
    title: 'Scenario Brief',
    href: '/brief',
    text: 'The brief fills a template from records and atmosphere formulas. Use Print or save as PDF, then review the numbered sources.',
  },
  {
    title: 'For Judges',
    href: '/judges',
    text: 'The judges page maps each criterion and award to a working part of the site, with a three-minute path.',
  },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
};

export function Tour({ open, onClose, step, setStep }: Props) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const current = tourSteps[step] ?? tourSteps[0]!;

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(timer);
      previousFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    navigate(current.href);
  }, [open, current.href, navigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (next: number) => {
    if (next < 0) return;
    if (next >= tourSteps.length) {
      onClose();
      return;
    }
    setStep(next);
  };

  return (
    <div className="tour-backdrop">
      <div
        className="tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="tour-meta">
          <span className="mono-label">Guided tour</span>
          <span className="mono-label">
            {step + 1} / {tourSteps.length}
          </span>
        </div>
        <h2 id="tour-title">{current.title}</h2>
        <p id="tour-text">{current.text}</p>
        <div className="tour-actions">
          <button type="button" className="btn" onClick={() => go(step - 1)} disabled={step === 0}>
            Back
          </button>
          <button type="button" className="btn primary" onClick={() => go(step + 1)}>
            {step === tourSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
          <button type="button" className="btn quiet" onClick={onClose}>
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
