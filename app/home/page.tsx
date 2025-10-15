import flatspotFont from "@/styles/fonts/flatspot-font";

export default function page() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-24 ${flatspotFont?.variable}`}>
      <h1 className="text-4xl font-bold">/home route</h1>
    </main>
  );
}