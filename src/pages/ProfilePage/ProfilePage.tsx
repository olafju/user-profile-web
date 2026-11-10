import { useState } from 'react';
import ApiError from '../../api/ApiError';
import type {
  ProfileFieldErrors,
  ProfileUpdate,
  UserProfile,
} from '../../types/profile';
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

const getProfileFieldErrors = (error: unknown): ProfileFieldErrors => {
  if (
    !(error instanceof ApiError) ||
    error.status !== 422 ||
    !error.fields
  ) {
    return {};
  }

  return {
    displayName: error.fields.displayName,
    bio: error.fields.bio,
  };
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
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>();

  const clearMessages = () => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (changes: ProfileUpdate) => {
    const displayNameChanged = changes.displayName !== profile.displayName;
    const bioChanged = changes.bio !== profile.bio;

    setProfile((currentProfile) => ({
      ...currentProfile,
      ...changes,
    }));
    setFieldErrors((currentErrors) => ({
      displayName: displayNameChanged
        ? undefined
        : currentErrors.displayName,
      bio: bioChanged ? undefined : currentErrors.bio,
    }));
    clearMessages();
  };

  const handleSave = async () => {
    if (isSaving || isRefreshing) {
      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    clearMessages();

    try {
      const savedProfile = await saveProfile({
        displayName: profile.displayName,
        bio: profile.bio,
      });
      setProfile(savedProfile);
      setSuccessMessage('Profile saved successfully.');
    } catch (error: unknown) {
      setFieldErrors(getProfileFieldErrors(error));
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
    setFieldErrors({});
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
        fieldErrors={fieldErrors}
        successMessage={successMessage}
        onChange={handleChange}
        onSave={handleSave}
        onRefresh={handleRefresh}
      />
    </ProfileTemplate>
  );
}

export default ProfilePage;
