import flatspotFont from "@/styles/fonts/flatspot-font";

export default function page() {
  return (
    <main className={`flex flex-col ${flatspotFont?.variable}`}>
      <h1 className="font-flatspot">redirected to /home page.tsx route via proxy (this is a differnet font than the root layout)</h1>
    </main>
  );
}