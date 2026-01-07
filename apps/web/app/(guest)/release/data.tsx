import Changelog from '@/types/changelog';

export const changelogs: Changelog[] = [
  {
    releaseDate: new Date('2025-12-28'),
    bannerImageUrl: '/images/version/0.2.0.png',
    version: '0.5.0',
    contributors: [
      'hassanrahim26',
      'Soumava-221B',
      'surajmaity1',
      'aashishdubey1',
      'sasidharan19',
      'Kishan-Agarwal-28',
      'anupkgurung',
    ],
    sections: [
      {
        title: 'Features',
        items: [
          {
            summary: 'Introduced monthly limits for event creation for basic users.',
            contributors: ['hassanrahim26'],
          },
          {
            summary:
              'Admins can now grant full feature access of the platform to users on request.',
            contributors: ['hassanrahim26'],
          },
        ],
      },
      {
        title: 'Enhancements',
        items: [
          {
            summary: 'Event categories now update automatically to show the latest options.',
            contributors: ['anupkgurung'],
          },
          {
            summary: 'Updates to improve app stability and bug-free app experience..',
            contributors: ['Soumava-221B'],
          },
          {
            summary: 'Location selection is now smoother with smarter city-specific options.',
            contributors: ['anupkgurung'],
          },
        ],
      },
      {
        title: 'Bug Fixes',
        items: [
          {
            summary: 'Events can now be added directly to Apple iCal.',
            contributors: ['surajmaity1'],
          },
          {
            summary: 'Host now can re-add the co-host to the event.',
            contributors: ['surajmaity1'],
          },
          {
            summary: 'Co-host can now leave an event voluntarily.',
            contributors: ['aashishdubey1'],
          },
          {
            summary: 'Host will not be able to edit the past events.',
            contributors: ['hassanrahim26'],
          },
          {
            summary: 'Guest cannot register for events that have already passed. ',
            contributors: ['sasidharan19'],
          },
          {
            summary:
              'Guest count indicators are now accurate and ensure total guests do not exceed event capacity.',
            contributors: ['aashishdubey1'],
          },
          {
            summary: 'Co-host can now view events in their upcoming events and my events page.',
            contributors: ['Kishan-Agarwal-28'],
          },
        ],
      },
    ],
    improvements: [],
    bugFixes: [],
  },
  {
    releaseDate: new Date('2025-11-30'),
    bannerImageUrl: '/images/version/0.2.0.png',
    version: '0.4.0',
    contributors: [
      'surajmaity1',
      'anupkgurung',
      'Soumava-221B',
      'TanishqSingla',
      'Pratiyushkumar',
      'hassanrahim26',
      'rituraj-OO7',
      'sasidharan19',
      'VinayakaHegade',
      'sudharsan3110',
      'sanyamjain04',
      'Chevalier-dev',
      'Sibasundar103',
      'aashishdubey1',
    ],
    sections: [
      {
        title: 'Features',
        items: [
          {
            summary: 'Easy way to add event to calendar directly from event page or email.',
            contributors: ['surajmaity1'],
          },
          {
            summary: 'Hosts can now invite multiple guests from event page.',
            contributors: ['aashishdubey1'],
          },
        ],
      },
      {
        title: 'Enhancements',
        items: [
          {
            summary:
              'Account deletion now keeps past events and requires canceling upcoming ones first.',
            contributors: ['Pratiyushkumar'],
          },
          {
            summary:
              'Replaced event registration text buttons with icons for a modern, intuitive feel.',
            contributors: ['sudharsan3110'],
          },
          {
            summary: 'Improved the communication page with a cleaner, more consistent chat design.',
            contributors: ['sasidharan19', 'vinayakahegade'],
          },
          {
            summary:
              'Event detail and planned events pages are now 25% faster and more responsive.',
            contributors: ['VinayakaHegade'],
          },
          {
            summary:
              'Integrated automated testing to make the codebase more reliable, efficient, and maintainable.',
            contributors: [
              'Soumava-221B',
              'TanishqSingla',
              'surajmaity1',
              'sanyamjain04',
              'Chevalier-dev',
              'rituraj-OO7',
              'Sibasundar103',
              'sudharsan3110',
              'Pratiyushkumar',
            ],
          },
        ],
      },
      {
        title: 'Bug Fixes',
        items: [
          {
            summary: 'Standardized date formatting across the app for improved readability.',
            contributors: ['rituraj-OO7'],
          },
          {
            summary: 'Public profiles now correctly display users’ joining dates.',
            contributors: ['sasidharan19'],
          },
          {
            summary: 'Event overview now displays host names.',
            contributors: ['rituraj-OO7'],
          },
          {
            summary: 'Event creation form now enforces a capacity limit of 1–1000.',
            contributors: ['hassanrahim26'],
          },
          {
            summary: 'Event descriptions now having consistent spacing between lines.',
            contributors: ['anupkgurung'],
          },
          {
            summary:
              'Corrected preview images when sharing event links with friends (removed HTML tags).',
            contributors: ['Chevalier-dev'],
          },
        ],
      },
    ],
    improvements: [],
    bugFixes: [],
  },
  {
    releaseDate: new Date('2025-10-07'),
    bannerImageUrl: '/images/version/0.2.0.png',
    version: '0.3.0',
    contributors: [
      'azeemuddinaziz',
      'Pratiyushkumar',
      'Soumava-221B',
      'aashishdubey1',
      'sudharsan3110',
      'Ayushsanjdev',
      'hassanrahim26',
      'anupkgurung',
      'rituraj-OO7',
      'Himanshu-Dhawale',
    ],
    sections: [
      {
        title: 'Features',
        items: [
          {
            summary:
              'Implemented a toggle to designate events as private, restricting access exclusively to shared links.',
            contributors: ['azeemuddinaziz'],
          },
          {
            summary:
              'Introduced image cropping functionality during upload to enhance control and presentation.',
            contributors: ['sudharsan3110'],
          },
          {
            summary:
              'Added comprehensive support for SocialLinks and Categories, including new APIs and validation, to strengthen data integrity.',
            contributors: ['anupkgurung', 'azeemuddinaziz'],
          },
        ],
      },
      {
        title: 'Enhancements',
        items: [
          {
            summary:
              'Made host profiles publicly accessible and refined underlying logic to improve user experience.',
            contributors: ['Ayushsanjdev'],
          },
          {
            summary:
              'Integrated Google Calendar and iCal support for registered events via both the application and email notifications.',
            contributors: ['surajmaity1'],
          },
          {
            summary:
              'Implemented attendee notifications for major event updates, including venue, date, and time, accompanied by enhanced email templates.',
            contributors: ['Pratiyushkumar'],
          },
          {
            summary:
              'Configured events to automatically set the end time one hour subsequent to the start time, streamlining event creation.',
            contributors: ['hassanrahim26'],
          },
          {
            summary: 'Published updated RSVP blog content to provide guidance on the RSVP process.',
            contributors: ['sudharsan3110'],
          },
          {
            summary:
              'Added functionality to remove uploaded event images during creation or editing.',
            contributors: ['Soumava-221B'],
          },
        ],
      },
      {
        title: 'Bug Fixes',
        items: [
          {
            summary:
              'Resolved login issues arising from primary email uniqueness constraints following account deactivation.',
            contributors: ['aashishdubey1'],
          },
          {
            summary:
              'Corrected multiple issues, including image removal upon pressing the Enter key, avatar name retrieval errors, Map Link validation, and event creation on the current date.',
            contributors: ['Soumava-221B'],
          },
          {
            summary:
              'Fixed an issue preventing hosts from viewing their events within the Upcoming tab.',
            contributors: ['rituraj-OO7'],
          },
          {
            summary: 'Ensured Magic Links expire accurately after the designated validity period.',
            contributors: ['hassanrahim26'],
          },
          {
            summary: 'Restored the previously missing Category field during event creation.',
            contributors: ['rituraj-OO7', 'Himanshu-Dhawale'],
          },
          {
            summary:
              'Updated image URL handling and resolved rendering inconsistencies across all pages.',
            contributors: ['sudharsan3110'],
          },
          {
            summary: 'Resolved invalid date errors triggered by selecting the same date twice.',
            contributors: ['Ayushsanjdev'],
          },
        ],
      },
    ],
    improvements: [],
    bugFixes: [],
  },
  {
    releaseDate: new Date('2025-08-06'),
    bannerImageUrl: '/images/version/0.2.0.png',
    version: '0.2.0',
    contributors: [
      'VinayakaHegade',
      'sasidharan19',
      'sudharsan3110',
      'azeemuddinaziz',
      'Pratiyushkumar',
      'hassanrahim26',
      'Himanshu-Dhawale',
      'rudraprasaaad',
      'Soumava-221B',
    ],
    sections: [
      {
        title: 'Features',
        items: [
          {
            summary:
              'Add Google OAuth Login - Implement OAuth authentication for seamless user login experience.',
            contributors: ['VinayakaHegade', 'sasidharan19'],
          },
          {
            summary:
              'Public Access to Create Event Page & UI Enhancements - Enable guest users to create events with improved authentication flow and user interface enhancements.',
            contributors: ['sudharsan3110'],
          },
          {
            summary:
              'DB Schema Change for better normalization and scaling - Optimize database structure for improved performance and scalability.',
            contributors: ['azeemuddinaziz', 'Pratiyushkumar', 'hassanrahim26', 'Soumava-221B'],
          },
        ],
      },
      {
        title: 'Bug Fixes',
        items: [
          {
            summary:
              'Social media links validation - Fix validation issues where forms accept invalid or random input data.',
            contributors: ['Himanshu-Dhawale'],
          },
          {
            summary:
              'Not able to login in In-app browser - Resolve authentication problems occurring specifically in in-app browser environments.',
            contributors: ['sasidharan19'],
          },
          {
            summary:
              'Pagination in Guest list - Fix pagination functionality issues in the guest list display feature.',
            contributors: ['hassanrahim26'],
          },
        ],
      },
      {
        title: 'Enhancements',
        items: [
          {
            summary:
              'Add Asterisk and "This Field is Required" Validation - Implement visual indicators and validation for required fields on Profile Page.',
            contributors: ['rudraprasaaad'],
          },
          {
            summary:
              'Add Country Code Dropdown to Phone Number Input - Enhance phone number input with country code selection on Profile Page.',
            contributors: ['rudraprasaaad'],
          },
          {
            summary:
              'Redirect the new user to events page - Improve user experience by automatically redirecting new users to events page.',
            contributors: ['azeemuddinaziz'],
          },
        ],
      },
    ],
    improvements: [],
    bugFixes: [],
  },
  {
    releaseDate: new Date('2025-07-05'),
    bannerImageUrl: '/images/version/0.1.0.png',
    version: '0.1.0',
    contributors: [
      '0xatulpatil',
      'DeltaDynamo',
      'ManasVerma007',
      'Pratiyushkumar',
      'VinayakaHegade',
      'codezuma',
      'sanyamjain04',
      'sasidharan19',
      'sudharsan3110',
      'theprogrammerinyou',
      'azeemuddinaziz',
      'hassanrahim26',
    ],
    sections: [
      {
        title: 'Event Creation & Management',
        items: [
          {
            summary:
              'Easy Event Creation - Create events effortlessly using a simple event creation form.',
            contributors: ['VinayakaHegade', 'Pratiyushkumar'],
          },
          {
            summary: 'Full Event Control - Create, update, and delete events seamlessly.',
            contributors: ['sanyamjain04 ', '0xatulpatil', 'Pratiyushkumar'],
          },
          {
            summary:
              'Centralized Event Management - View and manage all your planned events in one place.',
            contributors: ['theprogrammerinyou', 'DeltaDynamo'],
          },
          {
            summary:
              'Join Popular Events - Easily view the most popular events and register for them.',
            contributors: ['sudharsan3110'],
          },
        ],
      },
      {
        title: 'Security & Access',
        items: [
          {
            summary: 'Magic Link Authentication - Secure login using an email-based Magic Link.',
            contributors: ['sanyamjain04 '],
          },
          {
            summary:
              'Role-Based Access Control - Manage event permissions with different user roles.',
            contributors: ['ManasVerma007 '],
          },
          {
            summary: 'Co-Host Management - Add or remove co-hosts for better event administration.',
            contributors: ['0xatulpatil', 'sasidharan19'],
          },
        ],
      },
      {
        title: 'Attendee Management',
        items: [
          {
            summary:
              'Automated RSVP System - Attendees can RSVP for events and receive email confirmations.',
            contributors: ['theprogrammerinyou', 'ManasVerma007 '],
          },
          {
            summary:
              'One-Step Event Registration - Register and verify attendance in a single step.',
            contributors: ['ManasVerma007 '],
          },
          {
            summary: 'Guest List Dashboard - View and manage the event guest list in one place.',
            contributors: ['codezuma'],
          },
          {
            summary: 'Download Attendee List - Export guest details as an Excel sheet.',
            contributors: ['codezuma'],
          },
        ],
      },
      {
        title: 'Event Day Operations',
        items: [
          {
            summary:
              'QR Code-Based Check-In - Generate QR codes for event tickets and scan them for quick and secure event entry.',
            contributors: ['VinayakaHegade', 'ManasVerma007 '],
          },
          {
            summary: 'Quick Event Access - Find events easily using event-specific links.',
            contributors: ['sanyamjain04 '],
          },
        ],
      },
      {
        title: 'Communication & Performance',
        items: [
          {
            summary:
              'Email Notifications - Receive email updates for event invitations and changes.',
            contributors: ['theprogrammerinyou', 'DeltaDynamo'],
          },
          {
            summary:
              'Optimized Event Image Handling - Faster image loading and improved processing with efficient Amazon S3 storage for better performance.',
            contributors: ['codezuma'],
          },
          {
            summary: 'API Rate Limiting - Prevent spam with rate-limited API requests.',
            contributors: ['ManasVerma007 '],
          },
        ],
      },
      {
        title: 'Others',
        items: [
          {
            summary: 'Automation, Testing cum Documentation',
            contributors: ['azeemuddinaziz', 'hassanrahim26'],
          },
        ],
      },
    ],
    improvements: [],
    bugFixes: [],
  },
];
