export default async function SitePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to {domain}</h1>
      <p className="text-gray-600">
        This is a multi-tenant site. You are viewing the site for domain: <strong>{domain}</strong>
      </p>
    </div>
  );
}