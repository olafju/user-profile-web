import type { ReactNode } from 'react';
import AppShell from '../AppShell/AppShell';
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
    <AppShell
      title={title}
      description="Manage your account information and public profile."
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
    >
      <section className="profile-template__content" aria-label="Profile details">
        {children}
      </section>
    </AppShell>
  );
}

export default ProfileTemplate;
