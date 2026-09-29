import ProfileTemplate from '../../components/templates/ProfileTemplate/ProfileTemplate';

type ProfilePageProps = {
  onLogout: () => void;
};

function ProfilePage({ onLogout }: ProfilePageProps) {
  return (
    <ProfileTemplate title="Profile" onLogout={onLogout}>
      <p>The profile form will be connected in the next stage.</p>
    </ProfileTemplate>
  );
}

export default ProfilePage;
