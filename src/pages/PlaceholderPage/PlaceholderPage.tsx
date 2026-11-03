import AppShell from '../../components/templates/AppShell/AppShell';
import './PlaceholderPage.css';

type PlaceholderPageProps = {
  title: string;
  isLoggingOut?: boolean;
  onLogout: () => void;
};

function PlaceholderPage({
  title,
  isLoggingOut = false,
  onLogout,
}: PlaceholderPageProps) {
  return (
    <AppShell
      title={title}
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
    >
      <section className="placeholder-page">
        <p>{title} works</p>
      </section>
    </AppShell>
  );
}

export default PlaceholderPage;
