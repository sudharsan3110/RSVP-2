export interface ChatMessage {
  id: string;
  content: string;
  user: ChatUser;
  isNotification?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventInfo {
  id: string;
  name: string;
  slug: string;
  hostName: string;
  participantCount: number;
  eventImageUrl?: string;
}

export interface ChatUser {
  id: string;
  fullName: string;
  profileIcon: number;
  isHost?: boolean;
  role?: 'creator' | 'manager' | 'attendee';
}
