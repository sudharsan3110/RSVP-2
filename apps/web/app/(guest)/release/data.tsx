import Changelog from '@/model/changelog';

export const changelogs: Changelog[] = [
  {
    releaseDate: new Date('2021-09-01'),
    bannerImageUrl: '/images/version/version-0.21-dev.png',
    version: '0.21',
    contributors: ['codezuma'],
    features: [
      'Event pages and ticket types can now be accompanied by an emoji or an icon, helping attendees recognize them faster. [#4583] (By Sanyam)',
    ],
    improvements: [
      'Event category and date range filters now update on a single click. [#4522] (By Vinayak)',
      'Event URL field errors are now shown in a single line for better readability. [#4575] (By Chandersh)',
      'Added exception handling for third-party login providers. [#4602] (By Anoop)',
      'RSVP is now even faster with enhanced performance; initial load times are 1.2 seconds quicker. [#4642] (By Manish)',
    ],
    bugFixes: [
      'Fixed the "Mark all as read" bug in the notifications modal. The notification action now works as intended. [#4643] (By Mukesh)',
      'Improved login page for a smoother experience. [#4508] (By Laksh)',
      'Enabled ticket creation when date range or category grouping is applied in sub-events. [#4636] (By Sanyam)',
      'Resolved the issue with theme inconsistency on page refresh. [#4638] (By Vinayak)',
      'When duplicating a private event, it now retains its privacy settings. [#4568] (By Chandersh)',
    ],
  },
  {
    releaseDate: new Date('2021-07-15'),
    bannerImageUrl: '/images/version/version-0.21-dev.png',
    version: '0.20',
    contributors: ['eventPro', 'devGuru'],
    features: [
      'Introduced a new dashboard for event organizers with real-time analytics. [#4320] (By eventPro)',
      'Added support for multiple payment gateways, including PayPal and Stripe. [#4355] (By devGuru)',
    ],
    improvements: [
      'Optimized database queries, resulting in a 30% faster event listing page. [#4401] (By eventPro)',
      'Enhanced mobile responsiveness across all pages. [#4422] (By devGuru)',
    ],
    bugFixes: [
      'Fixed a timezone inconsistency issue for international events. [#4388] (By eventPro)',
      'Resolved a bug where certain special characters in event titles caused display issues. [#4405] (By devGuru)',
    ],
  },
  {
    releaseDate: new Date('2021-05-20'),
    bannerImageUrl: '/images/version/version-0.21-dev.png',
    version: '0.19',
    contributors: ['codeWizard', 'uiMaster'],
    features: [
      'Implemented a new ticketing system with QR code support for easy check-ins. [#4102] (By codeWizard)',
      'Added a drag-and-drop interface for customizing event pages. [#4150] (By uiMaster)',
    ],
    improvements: [
      'Redesigned the user profile page for better accessibility. [#4180] (By uiMaster)',
      'Improved search functionality with auto-suggestions and filters. [#4210] (By codeWizard)',
    ],
    bugFixes: [
      'Fixed a memory leak in the event creation wizard. [#4195] (By codeWizard)',
      'Resolved an issue where some email notifications were not being sent. [#4225] (By uiMaster)',
    ],
  },
];
