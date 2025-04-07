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
        <main className="max-w-6xl" id="about">
          <header className="dark flex prose text-secondary dark:prose-invert prose-h2:text-[1.75rem]">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">About</h2>
              <p>
                RSVP is is your go-to platform for creating, managing, and attending events with
                ease. Designed for both individuals and organizations, RSVP simplifies the entire
                event planning process, ensuring your events are nothing short of spectacular
                events! RSVP helps you to:
              </p>
              <div className="space-y-6">
                <ol className="list-none space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      1
                    </span>
                    <div>
                      <span className="font-semibold">Create Events:</span>{' '}
                      <span className="text-secondary">
                        Craft engaging event pages with customizable templates and comprehensive
                        details.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      2
                    </span>
                    <div>
                      <span className="font-semibold">Manage Attendees:</span>{' '}
                      <span className="text-secondary">
                        Effortlessly track RSVPs, send updates, and manage your guest list.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      3
                    </span>
                    <div>
                      <span className="font-semibold">Promote Events:</span>{' '}
                      <span className="text-secondary">
                        Utilize our advanced marketing tools to reach a wider audience and maximize
                        attendance.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      4
                    </span>
                    <div>
                      <span className="font-semibold">Ticketing & Registration:</span>{' '}
                      <span className="text-secondary">
                        Streamline the ticketing process with secure online registration and payment
                        options.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      5
                    </span>
                    <div>
                      <span className="font-semibold">Engage Attendees:</span>{' '}
                      <span className="text-secondary">
                        Foster community with interactive features like chat rooms, live Q&A, and
                        surveys.
                      </span>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </header>
        </main>

        <main className="max-w-6xl" id="changelog">
          <header className="flex flex-col items-start justify-between gap-8 pb-20 pt-20 md:flex-row md:items-end">
            <div className="max-w-xl space-y-4">
              <h2 className="text-4xl font-semibold">Changelog</h2>
              <p className="text-lg text-secondary md:text-xl">
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
