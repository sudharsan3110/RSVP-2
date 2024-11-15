import { VenueType } from '@prisma/client';
import { prisma } from '../connection';

interface Event {
  creatorId: number;
  name: string;
  category: string;
  startTime: string;
  endTime: string;
  eventDate: string;
  description: string;
  eventImageId: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
}

export class Events {
  static async create(eventDetails: Event) {
    const newEvent = await prisma.event.create({
      data: {
        ...eventDetails,
      },
    });
    return newEvent;
  }

  static async findById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    return event;
  }
}
