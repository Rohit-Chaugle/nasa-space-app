import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Ghostflame route error', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <aside className="rail" aria-hidden="true">
            <span className="plate-number">Plate 00</span>
          </aside>
          <div className="page-main">
            <div className="notice" role="alert">
              <h1>This page did not load.</h1>
              <p>
                The rest of the site is still available. Reload this page, or return to the flame
                on the home page.
              </p>
              <div className="button-row">
                <button type="button" className="btn primary" onClick={() => window.location.reload()}>
                  Reload page
                </button>
                <a className="btn" href="#/">
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
