import type { ReactNode } from 'react';
import Button from '../../atoms/Button/Button';
import Spinner from '../../atoms/Spinner/Spinner';
import './ProfileTemplate.css';

type ProfileTemplateProps = {
  title: string;
  children: ReactNode;
  isLoggingOut?: boolean;
  onLogout: () => void;
};

function ProfileTemplate({
  title,
  children,
  isLoggingOut = false,
  onLogout,
}: ProfileTemplateProps) {
  return (
    <main className="profile-template">
      <div className="profile-template__container">
        <header className="profile-template__header">
          <h1 className="profile-template__title">{title}</h1>
          <Button
            variant="secondary"
            disabled={isLoggingOut}
            onClick={onLogout}
          >
            {isLoggingOut && <Spinner label="Logging out" />}
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </header>

        <section className="profile-template__content">{children}</section>
      </div>
    </main>
  );
}

export default ProfileTemplate;
