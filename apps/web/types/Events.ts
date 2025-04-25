import { Cohost } from "./cohost";

export enum VenueType {
  Physical = 'PHYSICAL',
  Virtual = 'VIRTUAL',
  Later = 'LATER',
}

export class Event {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  category?: string;
  startTime: Date;
  endTime: Date;
  eventDate: Date;
  description: string;
  eventImageUrl: string;
  venueType?: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  capacity?: number;
  isActive: boolean;
  isCancelled?: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalAttendees?: number;
  creator?: {
    id: string;
    full_name: string;
    username: string;
    profile_icon: string;
  };
  cohosts?: Cohost[];

  constructor(data: Partial<Event>) {
    this.id = data.id ?? '';
    this.creatorId = data.creatorId ?? '';
    this.name = data.name ?? '';
    this.slug = data.slug ?? '';
    this.category = data.category;
    this.startTime = data.startTime ? new Date(data.startTime) : new Date();
    this.endTime = data.endTime ? new Date(data.endTime) : new Date();
    this.eventDate = data.eventDate ? new Date(data.eventDate) : new Date();
    this.description = data.description ?? '';
    this.eventImageUrl = data.eventImageUrl ?? '/images/demo-event-image.png';
    this.venueType = data.venueType;
    this.venueAddress = data.venueAddress;
    this.venueUrl = data.venueUrl;
    this.hostPermissionRequired = data.hostPermissionRequired ?? false;
    this.capacity = data.capacity;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.totalAttendees = data.totalAttendees;
    if (data.creator) this.creator = data.creator;
    if (data.cohosts) this.cohosts = data.cohosts;
  }

  checkCohost(cohostId?: string) {
    if (!cohostId) return false;
    return this.cohosts?.find((cohost) => cohost.user?.id === cohostId);
  }

  checkCohostByUserName(userName?: string) {
    if (!userName) return false;
    return this.cohosts?.find((cohost) => cohost.user?.userName?.toLowerCase() === userName.toLowerCase());
  }


  checkCreator(creatorId: string) {
    return this.creator?.id === creatorId;
  }

  get isPhysical() {
    return this.venueType === VenueType.Physical;
  }

  get isVirtual() {
    return this.venueType === VenueType.Virtual;
  }

  get isLater() {
    return this.venueType === VenueType.Later;
  }
}
