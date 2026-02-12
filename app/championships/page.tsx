import { headers } from "next/headers";
import Link from "next/link";

type ChampionshipListItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
};

async function getChampionships(): Promise<ChampionshipListItem[]> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/public/championships`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

function formatDateRange(start: string, end: string | null): string {
  const s = new Date(start);
  const startStr = s.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  if (!end) return startStr;
  const e = new Date(end);
  const endStr = e.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export default async function ChampionshipsPage() {
  const championships = await getChampionships();

  if (championships.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-gray-900 text-lg">No championships available</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Championships</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {championships.map((c) => (
          <Link
            key={c.id}
            href={`/championships/${c.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-red-500 hover:shadow-md transition"
          >
            <h2 className="text-xl font-bold text-gray-900">{c.name}</h2>
            {(c.startDate || c.endDate) && (
              <p className="text-gray-700 text-sm mt-2">
                {formatDateRange(c.startDate, c.endDate)}
              </p>
            )}
            <span className="inline-block mt-4 text-sm font-semibold text-red-600">
              View Details
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
