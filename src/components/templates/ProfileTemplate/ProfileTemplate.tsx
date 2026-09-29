import type { ReactNode } from 'react';
import Button from '../../atoms/Button/Button';
import './ProfileTemplate.css';

type ProfileTemplateProps = {
  title: string;
  children: ReactNode;
  onLogout: () => void;
};

function ProfileTemplate({ title, children, onLogout }: ProfileTemplateProps) {
  return (
    <main className="profile-template">
      <div className="profile-template__container">
        <header className="profile-template__header">
          <h1 className="profile-template__title">{title}</h1>
          <Button variant="secondary" onClick={onLogout}>
            Log out
          </Button>
        </header>

        <section className="profile-template__content">{children}</section>
      </div>
    </main>
  );
}

export default ProfileTemplate;
