export function PortalNotFound() {
  return (
    <div className="portal-screen">
      <div className="portal-screen__box">
        <h1>Portal Not Found</h1>
        <p>This portal does not exist. Please check the URL and try again.</p>
      </div>
    </div>
  );
}

export function PortalUnavailable() {
  return (
    <div className="portal-screen">
      <div className="portal-screen__box">
        <h1>Portal Unavailable</h1>
        <p>This portal is currently unavailable. Please contact support.</p>
      </div>
    </div>
  );
}

export function PortalLoading() {
  return (
    <div className="portal-screen">
      <div className="portal-screen__spinner" aria-label="Loading portal…" />
    </div>
  );
}

export function PortalError({ retry }: { retry?: () => void }) {
  return (
    <div className="portal-screen">
      <div className="portal-screen__box">
        <h1>Connection Error</h1>
        <p>Could not reach the server. Check your connection and try again.</p>
        {retry && (
          <button onClick={retry} className="portal-screen__retry">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
