import { Link } from 'react-router-dom';
import { Page } from '../components/Page';

export function NotFoundPage() {
  return (
    <Page
      plate="00"
      title={
        <>
          This page is not in the <em className="hl-em">notebook</em>.
        </>
      }
      lede="The address did not match a route. Nothing here is missing from the project; the path is wrong."
    >
      <div className="notice">
        <p>Use the navigation above, or start from the home page and the flame toggle.</p>
        <div className="button-row">
          <Link className="btn primary" to="/">
            Go to Home
          </Link>
          <Link className="btn" to="/atlas">
            Open Atlas
          </Link>
        </div>
      </div>
    </Page>
  );
}
