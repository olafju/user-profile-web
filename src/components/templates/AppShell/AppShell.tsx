import type { ReactNode } from 'react';
import Button from '../../atoms/Button/Button';
import Spinner from '../../atoms/Spinner/Spinner';
import './AppShell.css';

type AppShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  isLoggingOut?: boolean;
  onLogout: () => void;
};

function DashboardIcon() {
  return (
    <svg
      className="app-shell__dashboard-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" />
    </svg>
  );
}

function AppShell({
  title,
  description,
  children,
  isLoggingOut = false,
  onLogout,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <strong>App</strong>
        </div>

        <nav className="app-shell__navigation" aria-label="Main navigation">
          <ul>
            <li>
              <span
                className="app-shell__navigation-item app-shell__navigation-item--disabled"
                aria-disabled="true"
              >
                <DashboardIcon />
                <span>Dashboard</span>
              </span>
            </li>
            <li>
              <span
                className="app-shell__navigation-item app-shell__navigation-item--active"
                aria-current="page"
              >
                <ProfileIcon />
                <span>Profile</span>
              </span>
            </li>
          </ul>
        </nav>

      </aside>

      <div className="app-shell__workspace">
        <header className="app-shell__topbar">
          <div>
            <h1>{title}</h1>
            {description && (
              <p className="app-shell__description">{description}</p>
            )}
          </div>

          <Button
            variant="secondary"
            disabled={isLoggingOut}
            onClick={onLogout}
          >
            {isLoggingOut && <Spinner label="Logging out" />}
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </header>

        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
