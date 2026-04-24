import { headers } from "next/headers";
import AllDrivers from "@/components/landing/AllDrivers";

type PublicDriver = {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
};

async function getDrivers(): Promise<PublicDriver[]> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") ?? "http";
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/public/drivers`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        <section id="drivers">
          <AllDrivers drivers={drivers} />
        </section>
      </main>
    </div>
  );
}
