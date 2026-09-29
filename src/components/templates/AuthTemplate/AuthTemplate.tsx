import type { ReactNode } from 'react';
import './AuthTemplate.css';

type AuthTemplateProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function AuthTemplate({ title, description, children }: AuthTemplateProps) {
  return (
    <main className="auth-template">
      <section className="auth-template__card">
        <header className="auth-template__header">
          <h1 className="auth-template__title">{title}</h1>
          {description && (
            <p className="auth-template__description">{description}</p>
          )}
        </header>

        {children}
      </section>
    </main>
  );
}

export default AuthTemplate;
