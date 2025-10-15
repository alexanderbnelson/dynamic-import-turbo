import type { Metadata } from "next";
import type { Theme } from "@/types/theme";

export const metadata: Metadata = {
  title: "Multi-Tenant Site",
  description: "A multi-tenant application with dynamic domain routing",
};

// Simulate database fetch like in the subject project
async function getSiteData(): Promise<{ themeName: string }> {
  // Simulate async database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        themeName: Math.random() > 0.5 ? "one" : "two",
      });
    }, 100);
  });
}

function toKebabCase(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // Mimic the subject project's pattern exactly
  const site = await getSiteData();
  const themeName = site?.themeName ? toKebabCase(site?.themeName) : "one";

  const selectedTheme = await import(`@/styles/themes/theme-${themeName}`);

  console.log(themeName);
  console.log(selectedTheme);

  const theme = (selectedTheme.default as Theme) ?? null;

  return (
    <div
      className="min-h-screen bg-gray-50"
      {...(site?.themeName
        ? {
            "data-color-theme": `theme-${toKebabCase(site?.themeName)}-palette`,
          }
        : {})}
      {...(site?.themeName
        ? { "data-font-theme": `theme-${toKebabCase(site?.themeName)}-font` }
        : {})}
    >
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Site: {domain}</h1>
              <span className="text-sm text-gray-500">(Public Site)</span>
              <span className="text-sm text-gray-500">Selected Theme: {theme?.name}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          Multi-Tenant Application - Domain: {domain}
        </div>
      </footer>
    </div>
  );
}
