import Championship from '@/components/landing/Championship';
import DriversSpotlight from '@/components/landing/DriversSpotlight';
import Hero from '@/components/landing/Hero';
import NewDrivers from '@/components/landing/NewDrivers';
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

async function getNewestDrivers() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') ?? 'http';
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/public/drivers/newest`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getFeaturedEvents() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") ?? "http";
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/public/events/featured`, {
      cache: "no-store",
    });
    if (!res.ok) return { now: new Date().toISOString(), events: [] };
    const data = await res.json();
    return { now: data.now ?? new Date().toISOString(), events: Array.isArray(data.events) ? data.events : [] };
  } catch {
    return { now: new Date().toISOString(), events: [] };
  }
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
  const [spotlightDrivers, featured, newestDrivers, featuredEvents] = await Promise.all([
    getSpotlightDrivers(),
    getFeaturedChampionship(),
    getNewestDrivers(),
    getFeaturedEvents(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        <section id="hero">
          <Hero events={featuredEvents.events} />
        </section>

        <section id="newdrivers">
          <NewDrivers drivers={newestDrivers} />
        </section>

        <section id="championship">
          <Championship
            championship={featured.championship}
            hasStandings={featured.hasStandings}
            standings={featured.standings}
          />
        </section>

        <section id="driversspotlight">
          <DriversSpotlight drivers={spotlightDrivers} />
        </section>
      </main>
    </div>
  );
}