import Championship from '@/components/landing/Championship';
import DriversSpotlight from '@/components/landing/DriversSpotlight';
import Gallery from '@/components/landing/Gallery';
import Hero from '@/components/landing/Hero';
import NewDrivers from '@/components/landing/NewDrivers';
import {
  getRoundsFeedForLanding,
  getFeaturedChampionshipForLanding,
} from "@/lib/public-championship";
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

export default async function LandingPage() {
  const [spotlightDrivers, featured, newestDrivers, roundsFeed] = await Promise.all([
    getSpotlightDrivers(),
    getFeaturedChampionshipForLanding(),
    getNewestDrivers(),
    getRoundsFeedForLanding(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        <section id="hero">
          <Hero rounds={roundsFeed} />
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

        <section id="gallery">
          <Gallery />
        </section>
      </main>
    </div>
  );
}