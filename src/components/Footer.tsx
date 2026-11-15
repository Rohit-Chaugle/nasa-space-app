import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">Ghostflame</p>
          <p>Team Targaryen. NASA Space Apps Challenge entry.</p>
        </div>
        <div>
          <p>
            Built from the challenge brief and NASA's Physical Science Informatics (PSI) metadata.
            No raw sensor data is hosted here. PSI holds the raw data.
          </p>
          <p className="footer-links">
            <Link to="/method">Method</Link>
            <a href="https://psi.nasa.gov/" rel="noreferrer">
              NASA PSI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
