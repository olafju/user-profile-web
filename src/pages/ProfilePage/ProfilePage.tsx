import Button from '../../components/atoms/Button/Button';
import './ProfilePage.css';

type ProfilePageProps = {
  onLogout: () => void;
};

function ProfilePage({ onLogout }: ProfilePageProps) {
  return (
    <main className="profile-page">
      <section className="profile-page__content">
        <h1>Profile</h1>
        <p>The profile interface will be added in the next stage.</p>
        <Button onClick={onLogout}>Log out</Button>
      </section>
    </main>
  );
}

export default ProfilePage;
