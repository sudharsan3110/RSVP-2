import Guest from '@/components/common/header/Guest';
import Footer from '@/components/common/Footer';

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Guest />
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>
      <Footer />
    </>
  );
}
