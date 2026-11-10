export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
};

export type ProfileUpdate = Pick<UserProfile, 'displayName' | 'bio'>;

export type ProfileFieldErrors = Partial<
  Record<keyof ProfileUpdate, string>
>;
