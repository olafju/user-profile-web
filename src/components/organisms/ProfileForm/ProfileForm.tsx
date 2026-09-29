import type { FormEvent } from 'react';
import type { ProfileUpdate, UserProfile } from '../../../types/profile';
import Button from '../../atoms/Button/Button';
import Message from '../../atoms/Message/Message';
import Spinner from '../../atoms/Spinner/Spinner';
import FormField from '../../molecules/FormField/FormField';
import ReadOnlyField from '../../molecules/ReadOnlyField/ReadOnlyField';
import TextareaField from '../../molecules/TextareaField/TextareaField';
import './ProfileForm.css';

type ProfileFormProps = {
  profile: UserProfile;
  isSaving?: boolean;
  isRefreshing?: boolean;
  saveError?: string;
  saveSuccess?: string;
  onChange: (profile: ProfileUpdate) => void;
  onSave: () => void;
  onRefresh: () => void;
};

function ProfileForm({
  profile,
  isSaving = false,
  isRefreshing = false,
  saveError,
  saveSuccess,
  onChange,
  onSave,
  onRefresh,
}: ProfileFormProps) {
  const isBusy = isSaving || isRefreshing;

  const handleDisplayNameChange = (displayName: string) => {
    onChange({ displayName, bio: profile.bio });
  };

  const handleBioChange = (bio: string) => {
    onChange({ displayName: profile.displayName, bio });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isBusy) {
      onSave();
    }
  };

  return (
    <form className="profile-form" aria-busy={isBusy} onSubmit={handleSubmit}>
      <div className="profile-form__details">
        <ReadOnlyField label="ID" value={profile.id} />
        <ReadOnlyField label="Email" value={profile.email} />
      </div>

      <FormField
        id="display-name"
        label="Display name"
        type="text"
        value={profile.displayName}
        placeholder="Enter your display name"
        disabled={isBusy}
        onChange={handleDisplayNameChange}
      />

      <TextareaField
        id="bio"
        label="Bio"
        value={profile.bio}
        placeholder="Write something about yourself"
        disabled={isBusy}
        onChange={handleBioChange}
      />

      {saveError ? (
        <Message variant="error">{saveError}</Message>
      ) : saveSuccess ? (
        <Message variant="success">{saveSuccess}</Message>
      ) : null}

      <div className="profile-form__actions">
        <Button type="submit" disabled={isBusy}>
          {isSaving && <Spinner label="Saving profile" />}
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
        <Button variant="secondary" disabled={isBusy} onClick={onRefresh}>
          {isRefreshing && <Spinner label="Refreshing profile" />}
          {isRefreshing ? 'Refreshing...' : 'Refresh profile'}
        </Button>
      </div>
    </form>
  );
}

export default ProfileForm;
