import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
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

function PlaceholderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 5h14v14H5zM9 9h6m-6 4h6" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3V9Zm4 10h4" />
    </svg>
  );
}

const getNavigationClassName = ({ isActive }: { isActive: boolean }) =>
  `app-shell__navigation-item${
    isActive ? ' app-shell__navigation-item--active' : ''
  }`;

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
              <NavLink to="/dashboard" className={getNavigationClassName}>
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={getNavigationClassName}>
                <ProfileIcon />
                <span>Profile</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={getNavigationClassName}>
                <ProductIcon />
                <span>Products</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/bar-2" className={getNavigationClassName}>
                <PlaceholderIcon />
                <span>Bar 2</span>
              </NavLink>
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

          <div className="app-shell__topbar-actions">
            <div className="app-shell__search-placeholder" aria-hidden="true">
              <SearchIcon />
              <span>Search...</span>
              <kbd>Ctrl K</kbd>
            </div>

            <span
              className="app-shell__icon-placeholder"
              aria-hidden="true"
            >
              <NotificationIcon />
            </span>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `app-shell__profile-link${
                  isActive ? ' app-shell__profile-link--active' : ''
                }`
              }
              aria-label="Open profile"
            >
              <ProfileIcon />
            </NavLink>

            <Button
              variant="secondary"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              {isLoggingOut && <Spinner label="Logging out" />}
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </Button>
          </div>
        </header>

        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
