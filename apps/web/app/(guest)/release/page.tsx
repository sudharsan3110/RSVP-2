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
      <main className="max-w-6xl">
        <header className="flex flex-col items-start justify-between gap-8 pb-20 pt-40 md:flex-row md:items-end">
          <div className="max-w-xl space-y-4">
            <h2 className="text-4xl font-semibold">Changelog</h2>
            <p className="text-lg text-secondary md:text-xl">
              A latest-to-greatest list of our releases,packed with new features, improvements, and
              bug fixes.
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
          <ChangelogCard changelog={selectedChangelog} />
        </section>
      </main>
    </Container>
  );
};

export default ReleasePage;
