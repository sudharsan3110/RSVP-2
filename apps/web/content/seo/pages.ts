export type SeoPageConfig = {
  slug: string;
  type: 'use-case' | 'problem' | 'alternative';
  title: string;
  description: string;
  canonical: string;
  lang?: string;
  og: {
    title: string;
    description: string;
    image: string;
    type?: 'website' | 'article';
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  sections: {
    title: string;
    bullets: string[];
    cta?: { label: string; href: string } | null;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  robots?: {
    index: boolean;
    follow: boolean;
  };
};

export const seoPages: SeoPageConfig[] = [
  {
    slug: 'meetups',
    type: 'use-case',
    title: 'Event Hosting for Meetups',
    description: 'Host meetups with online RSVPs, tickets, and attendee management using RSVP.',
    canonical: 'https://rsvp.kim/use-cases/meetups',
    lang: 'en',
    og: {
      title: 'Event Hosting for Meetups',
      description: 'Create and manage meetups with online RSVPs and real-time attendee tracking.',
      image: 'https://rsvp.kim/og/default.png',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Event Hosting for Meetups',
      description: 'Host and manage meetups effortlessly using RSVP.',
      image: 'https://rsvp.kim/og/default.png',
    },
    sections: [
      {
        title: 'Problems with Hosting Meetups',
        bullets: [
          'Manual RSVP tracking using Google Forms',
          'No real-time attendee visibility',
          'Difficult to share updates with attendees',
        ],
      },
      {
        title: 'How RSVP Helps',
        bullets: [
          'Create an event in minutes',
          'Share a simple event link',
          'Track attendees live',
        ],
        cta: {
          label: 'Create a Meetup',
          href: '/create-event',
        },
      },
    ],
    faqs: [
      {
        question: 'Is RSVP free for meetups?',
        answer: 'Yes, you can host free meetups with RSVP.',
      },
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  {
    slug: 'college-events',
    type: 'use-case',
    title: 'Create Tickets for College Events',
    description: 'Host college fests, workshops, and student events with free online tickets.',
    canonical: 'https://rsvp.kim/use-cases/college-events',
    lang: 'en',
    og: {
      title: 'Create Tickets for College Events',
      description: 'Manage college fests, workshops, and student events with free tickets.',
      image: 'https://rsvp.kim/og/default.png',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Create Tickets for College Events',
      description: 'Free online ticketing for college events using RSVP.',
      image: 'https://rsvp.kim/og/default.png',
    },
    sections: [
      {
        title: 'Challenges with College Events',
        bullets: ['No central ticketing system', 'Manual registrations', 'Attendance confusion'],
      },
      {
        title: 'Why Students Use RSVP',
        bullets: ['Free event tickets', 'Easy sharing', 'Works on mobile'],
        cta: {
          label: 'Host a College Event',
          href: '/create-event',
        },
      },
    ],
    faqs: [
      {
        question: 'Can we host free college events?',
        answer: 'Yes, RSVP supports free student events.',
      },
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
];
