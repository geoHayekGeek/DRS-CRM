import Championship from '@/components/landing/Championship';
import DriversSpotlight from '@/components/landing/DriversSpotlight';
import Hero from '@/components/landing/Hero';
import { headers } from 'next/headers';

async function getSpotlightDrivers() {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/public/drivers/spotlight`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getFeaturedChampionship() {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/public/championships/featured`, {
    cache: 'no-store',
  });
  if (!res.ok) return { championship: null, hasStandings: false };
  return res.json();
}

export default async function LandingPage() {
  const [spotlightDrivers, featured] = await Promise.all([
    getSpotlightDrivers(),
    getFeaturedChampionship(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        <section id="hero">
          <Hero />
        </section>

        <section id="driversspotlight">
          <DriversSpotlight drivers={spotlightDrivers} />
        </section>

        <section id="championship">
          <Championship
            championship={featured.championship}
            hasStandings={featured.hasStandings}
            standings={featured.standings}
          />
        </section>
      </main>
    </div>
  );
}