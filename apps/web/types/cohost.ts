import { Event } from './events';
import { User } from './user';

export enum Role {
  CREATOR = 'CREATOR',
  MANAGER = 'MANAGER',
  READ_ONLY = 'READ_ONLY',
  CELEBRITY = 'CELEBRITY',
}

export class Cohost {
  id: string;
  userId: string;
  eventId: string;
  role: Role;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  user: User | null;
  event: Event | null;

  constructor(data: Partial<Cohost>) {
    this.id = data.id ?? '';
    this.userId = data.userId ?? '';
    this.eventId = data.eventId ?? '';
    this.role = data.role ?? Role.READ_ONLY;
    this.isDeleted = data.isDeleted ?? false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.user = data.user ? new User(data.user) : null;
    this.event = data.event ? new Event(data.event) : null;
  }

  isCreator(): boolean {
    return this.role === Role.CREATOR;
  }

  isManager(): boolean {
    return this.role === Role.MANAGER;
  }

  isReadOnly(): boolean {
    return this.role === Role.READ_ONLY;
  }

  isCelebrity(): boolean {
    return this.role === Role.CELEBRITY;
  }

  hasEditPermission(): boolean {
    return this.role === Role.CREATOR || this.role === Role.MANAGER;
  }

  updateRole(newRole: Role): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  getDisplayName(): string {
    return this.user?.fullName || this.user?.userName || 'Unknown User';
  }
}
