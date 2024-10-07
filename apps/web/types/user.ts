export interface IUser {
  id: number;
  primary_email: string;
  secondary_email?: string;
  full_name: string;
  isCompleted: boolean;
  location?: string;
  bio?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  profile_icon?: string;
  event_participation_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
