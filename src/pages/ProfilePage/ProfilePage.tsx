import { useState } from 'react';
import type { ProfileUpdate, UserProfile } from '../../types/profile';
import ProfileForm from '../../components/organisms/ProfileForm/ProfileForm';
import ProfileTemplate from '../../components/templates/ProfileTemplate/ProfileTemplate';

type ProfilePageProps = {
  initialProfile: UserProfile;
  saveProfile: (profile: ProfileUpdate) => Promise<UserProfile>;
  refreshProfile: () => Promise<UserProfile>;
  isLoggingOut?: boolean;
  onLogout: () => void;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to update the profile. Try again.';
};

function ProfilePage({
  initialProfile,
  saveProfile,
  refreshProfile,
  isLoggingOut,
  onLogout,
}: ProfilePageProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const clearMessages = () => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (changes: ProfileUpdate) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      ...changes,
    }));
    clearMessages();
  };

  const handleSave = async () => {
    if (isSaving || isRefreshing) {
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      const savedProfile = await saveProfile({
        displayName: profile.displayName,
        bio: profile.bio,
      });
      setProfile(savedProfile);
      setSuccessMessage('Profile saved successfully.');
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (isSaving || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    clearMessages();

    try {
      const refreshedProfile = await refreshProfile();
      setProfile(refreshedProfile);
      setSuccessMessage('Profile refreshed successfully.');
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProfileTemplate
      title="Profile"
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
    >
      <ProfileForm
        profile={profile}
        isSaving={isSaving}
        isRefreshing={isRefreshing}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onChange={handleChange}
        onSave={handleSave}
        onRefresh={handleRefresh}
      />
    </ProfileTemplate>
  );
}

export default ProfilePage;
