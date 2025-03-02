import { Event } from './Events';
import { IUser } from './user';

export enum Status {
  All = '0',
  Going = '1',
  NotGoing = '2',
  Waiting = '3',
  Pending = '4',
  Invited = '5',
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
  status: Status;
  user: IUser;
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
    this.user = data.user;
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
