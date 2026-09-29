export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
};

export type ProfileUpdate = Pick<UserProfile, 'displayName' | 'bio'>;
