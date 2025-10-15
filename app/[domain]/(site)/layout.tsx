import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Tenant Site',
  description: 'A multi-tenant application with dynamic domain routing',
};

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Site: {domain}</h1>
              <span className="text-sm text-gray-500">(Public Site)</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          Multi-Tenant Application - Domain: {domain}
        </div>
      </footer>
    </div>
  );
}