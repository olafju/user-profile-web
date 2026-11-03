import AppShell from '../../components/templates/AppShell/AppShell';
import './DashboardPage.css';

type DashboardPageProps = {
  isLoggingOut?: boolean;
  onLogout: () => void;
};

const dashboardCards = ['Card 1', 'Card 2', 'Card 3', 'Card 4'];

function DashboardPage({
  isLoggingOut = false,
  onLogout,
}: DashboardPageProps) {
  return (
    <AppShell
      title="Dashboard"
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
    >
      <section className="dashboard-page" aria-label="Dashboard placeholders">
        {dashboardCards.map((card) => (
          <article className="dashboard-page__card" key={card}>
            <span className="dashboard-page__card-mark" aria-hidden="true" />
            <h2>{card}</h2>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

export default DashboardPage;
