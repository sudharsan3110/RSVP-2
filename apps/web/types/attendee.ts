import { Event } from './events';
import { User } from './user';

export enum AttendeeStatus {
  Going = 'GOING',
  NotGoing = 'NOT_GOING',
  Waiting = 'WAITING',
  Pending = 'PENDING',
  Invited = 'INVITED',
}


export class Attendee {
  id: string;
  userId: string;
  eventId: string;
  registrationTime: Date;
  hasAttended: boolean;
  checkInTime: Date | null;
  feedback: string | null;
  qrToken: string;
  status: AttendeeStatus;
  user: User | null;
  allowedStatus: boolean;
  deleted: boolean;
  updatedAt: Date;
  event: Event;

  constructor(data: Attendee) {
    this.id = data.id;
    this.userId = data.userId;
    this.eventId = data.eventId;
    this.registrationTime = data.registrationTime;
    this.hasAttended = data.hasAttended;
    this.checkInTime = data.checkInTime;
    this.feedback = data.feedback;
    this.user = data.user ? new User(data.user) : null;
    this.qrToken = data.qrToken;
    this.status = data.status;
    this.allowedStatus = data.allowedStatus;
    this.deleted = data.deleted;
    this.updatedAt = data.updatedAt;
    this.event = data.event;
  }

  static fromJSON(json: string | object): Attendee {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Attendee(data);
  }

  get isActive(): boolean {
    return !this.deleted;
  }
}
