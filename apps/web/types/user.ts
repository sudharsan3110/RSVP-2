import { userAvatarOptions } from "@/utils/constants";

export class User {
  id: string;
  primaryEmail: string;
  secondaryEmail?: string;
  contact?: string;
  fullName?: string;
  userName?: string;
  isCompleted: boolean;
  location?: string;
  bio?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  profileIcon: number;
  eventParticipationEnabled: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    this.id = data.id ?? '';
    this.primaryEmail = data.primaryEmail ?? '';
    this.secondaryEmail = data.secondaryEmail;
    this.contact = data.contact;
    this.fullName = data.fullName;
    this.userName = data.userName;
    this.isCompleted = data.isCompleted ?? false;
    this.location = data.location;
    this.bio = data.bio;
    this.twitter = data.twitter;
    this.instagram = data.instagram;
    this.website = data.website;
    this.profileIcon = data.profileIcon ?? 1;
    this.eventParticipationEnabled = data.eventParticipationEnabled ?? false;
    this.isDeleted = data.isDeleted ?? false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  get isProfileComplete(): boolean {
    return this.isCompleted;
  }

  get initials(): string {
    return this.fullName?.split(' ').map((name) => name[0]).join('') ?? 'A';
  }

  get profileIconUrl(): string {
    return userAvatarOptions.find((option) => option.id === this.profileIcon)?.src ?? userAvatarOptions[1].src;
  }
}
