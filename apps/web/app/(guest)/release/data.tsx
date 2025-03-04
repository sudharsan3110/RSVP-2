import Changelog from '@/types/changelog';

export const changelogs: Changelog[] = [
  {
    releaseDate: new Date('2021-09-01'),
    bannerImageUrl: '/images/version/version-0.21-dev.png',
    version: '0.21',
    contributors: [],
    features: [
      {
        summary:
          'Event pages and ticket types can now be accompanied by an emoji or an icon, helping attendees recognize them faster. [#4583] ',
        contributors: ['codezuma'],
      },
    ],
    improvements: [],
    bugFixes: [],
  },
];
