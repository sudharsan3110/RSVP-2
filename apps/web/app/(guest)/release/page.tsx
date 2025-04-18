'use client';
import Container from '@/components/common/Container';
import { changelogs } from './data';
import ChangelogCard from '@/components/release/ChangelogCard';
import { ComboboxSelect } from '@/components/ui/combobox';
import { useState } from 'react';

const selectOptions: FormSelectOption[] = changelogs.map((changelog, index) => ({
  label: `Version ${changelog.version}`,
  value: index.toString(),
}));

const ReleasePage = () => {
  const [selectedIndex, setSelectedIndex] = useState<string>('0');

  const handleSelectChange = (index: string) => {
    setSelectedIndex(index);
  };

  const selectedChangelog = changelogs[parseInt(selectedIndex || '0')];
  return (
    <Container asChild>
      <section className="text-secondary">
        <main className="max-w-full" id="about">
          <header className="dark prose max-w-full marker:text-white text-secondary dark:prose-invert prose-h2:text-[1.75rem] prose-p:tracking-wide">
            <div className="space-y-0">
              <h2 className="text-[2.25rem] font-semibold">About</h2>
              <p>
                RSVP is  your go-to platform for creating, managing, and attending events with
                ease. Designed for both individuals and organizations, RSVP simplifies the entire
                event planning process, ensuring your events are nothing short of spectacular
                events! RSVP helps you to:
              </p>
              <div className="space-y-0">
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <span className="font-semibold">Create Memorable Events:</span>{' '}
                    <span className="text-secondary">
                    Design captivating event pages using customizable templates and detailed information fields.
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">Manage Attendees Seamlessly:</span>{' '}
                    <span className="text-secondary">
                    Keep track of RSVPs, send real-time updates, and organize your guest list with ease.
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">Promote Like a Pro:</span>{' '}
                    <span className="text-secondary">
                    Leverage powerful marketing tools to expand your reach and boost attendance.
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">Ticketing & Registration:</span>{' '}
                    <span className="text-secondary">
                      Streamline the ticketing process with secure online registration and payment
                      options.
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">Engage Attendees:</span>{' '}
                    <span className="text-secondary">
                      Foster community with interactive features like chat rooms, live Q&A, and
                      surveys.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </header>
        </main>

        <main className="max-w-6xl" id="changelog">
          <header className="flex flex-col items-start justify-between gap-8 pb-20 pt-20 md:flex-row md:items-end">
            <div className="max-w-fill 00 space-y-4">
              <h2 className="text-[1.75rem]  font-semibold">Changelog</h2>
              <p className="text-[1rem]  text-secondary md:text-[1rem]">
                A latest-to-greatest list of our releases,packed with new features, improvements,
                and bug fixes.
              </p>
            </div>
            <ComboboxSelect
              className="w-full md:w-48"
              options={selectOptions}
              placeholder="Select Version..."
              testId="changelog-version-select"
              onValueChange={handleSelectChange}
              value={selectedIndex}
            />
          </header>
          <section className="mx-auto">
            {selectedChangelog && <ChangelogCard changelog={selectedChangelog} />}
          </section>
        </main>
      </section>
    </Container>
  );
};

export default ReleasePage;
