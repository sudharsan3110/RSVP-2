type SeoSectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function SeoSection({ title, children }: SeoSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
