import React from 'react';

interface ProfileSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ProfileSection = ({ title, description, children }: ProfileSectionProps) => (
  <section className="flex flex-wrap gap-8">
    <div className="w-full max-w-sm">
      <h2 className="font-semibold text-white">{title}</h2>
      <p className="text-sm text-secondary">{description}</p>
    </div>
    <div className="flex w-full max-w-lg flex-col gap-4">{children}</div>
  </section>
);

export default ProfileSection;
