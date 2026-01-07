import React from 'react';

type SeoPageProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function SeoPage({ title, description, children }: SeoPageProps) {
  return (
    <>
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-gray-600 max-w-3xl">{description}</p>
      </header>

      <article className="space-y-12">{children}</article>
    </>
  );
}
