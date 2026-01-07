// components/ChangelogCard.tsx
import Image from 'next/image';
import ContributorAvatar from './ContributorAvatar';
import Changelog, { Features, ChangeLogSection } from '@/types/changelog';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatDate';

type Props = {
  changelog: Changelog;
};

interface ChangelogProps {
  title: string;
  features: Features[];
  className?: string;
}

const ChangelogList: React.FC<ChangelogProps> = ({ title, features, className }) => {
  return (
    <div className={cn('mt-4', className)}>
      <h2 className="mb-4 text-[1.25rem] font-semibold text-white">{title}</h2>
      <ul
        className={cn(
          'ml-5 list-disc',
          className === 'features-section' ? 'space-y-0' : 'space-y-2'
        )}
      >
        {features.map((feature, index) => (
          <li key={index}>
            {feature.summary} (By{' '}
            {feature.contributors.map((contributor, i, arr) => (
              <span key={contributor}>
                <Link href={`https://github.com/${contributor}`} className="hover:underline">
                  {contributor}
                </Link>
                {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' and ' : ''}
              </span>
            ))}
            )
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChangelogCard = ({ changelog }: Props) => {
  return (
    <div className="group flex sm:space-x-8">
      <span className="relative -top-2 hidden whitespace-nowrap sm:block">
        {formatDate(changelog.releaseDate, { dateOnly: true })}
      </span>
      <div className="flex space-x-4 sm:space-x-8">
        <div className="relative h-full">
          <span className="absolute left-[-3px] top-0 h-2 w-2 rounded-full bg-primary" />
          <div className="h-full w-0.5 bg-separator" />
        </div>
        <div className="pb-16 group-last:pb-0">
          <span className="relative -top-2 mb-4 block whitespace-nowrap sm:hidden">
            {formatDate(changelog.releaseDate, { dateOnly: true })}
          </span>
          <figure className="relative">
            <p className="absolute left-4 top-4 font-bold  text-lg md:text-xl xl:text-2xl text-white">
              Version {changelog.version}
            </p>
            <Image
              src={changelog.bannerImageUrl}
              alt={`version-${changelog.version}`}
              className="h-auto w-full overflow-hidden rounded-sm"
              placeholder="blur"
              loading="eager"
              blurDataURL="/images/version/release-blur.svg"
              priority={true}
              width={800}
              height={500}
            />
          </figure>
          <div className="mt-8">
            <h2 className="mb-4 text-[1.75rem] font-semibold text-white"> Contributors </h2>
            <ul className="flex items-end gap-2 flex-wrap">
              {changelog.contributors.map((contributor) => (
                <li key={contributor} className="inline-block h-8 w-8">
                  <ContributorAvatar githubUsername={contributor} />
                </li>
              ))}
            </ul>
          </div>

          {changelog.sections?.map((section, index) => (
            <ChangelogList
              key={index}
              title={section.title}
              features={section.items}
              className="features-section "
            />
          ))}

          {changelog.improvements?.length > 0 && (
            <ChangelogList title="🔧 Improvements" features={changelog.improvements} />
          )}

          {changelog.bugFixes?.length > 0 && (
            <ChangelogList title="🐞 Bug Fixes" features={changelog.bugFixes} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangelogCard;
