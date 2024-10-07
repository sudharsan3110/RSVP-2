import dayjs from "dayjs";
import Image from "next/image";
import ContributorAvatar from "./ContributorAvatar";
import Changelog from "@/model/changelog";

type Props = {
  changelog: Changelog;
};

const ChangelogCard = ({ changelog }: Props) => {
  return (
    <div className="group flex sm:space-x-8">
      <span className="relative -top-2 hidden whitespace-nowrap sm:block">
        {dayjs(changelog.releaseDate).format("MMM D, YYYY")}
      </span>
      <div className="flex space-x-4 sm:space-x-8">
        <div className="relative h-full">
          <span className="absolute left-[-3px] top-0 h-2 w-2 rounded-full bg-primary" />

          <div className="h-full w-0.5 bg-separator" />
        </div>
        <div className="pb-16 group-last:pb-0">
          <span className="relative -top-2 mb-4 block whitespace-nowrap sm:hidden">
            {dayjs(changelog.releaseDate).format("MMM D, YYYY")}
          </span>
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
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">🧩 Contributors </h2>
            <ul className="flex items-end space-x-2">
              {changelog.contributors.map((contributor) => (
                <li key={contributor} className="inline-block h-8 w-8">
                  <ContributorAvatar githubUsername={contributor} />
                </li>
              ))}
            </ul>
          </div>
          {changelog.features.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">🎉 New Features </h2>
              <ul className="ml-5 list-disc space-y-2 leading-8">
                {changelog.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          {changelog.improvements.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">🔧 Improvements </h2>
              <ul className="ml-5 list-disc space-y-2 leading-8">
                {changelog.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
          {changelog.bugFixes.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">🐞 Bug Fixes </h2>
              <ul className="ml-5 list-disc space-y-2 leading-8">
                {changelog.bugFixes.map((bugFix, index) => (
                  <li key={index}>{bugFix}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangelogCard;
