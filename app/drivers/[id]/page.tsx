import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSessionDisplayName } from "@/lib/session-utils";
import { formatPoints } from "@/lib/format-points";

type DriverPublic = {
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
};

type SessionPublic = {
  sessionType: string;
  group: string | null;
  position: number;
  points: number;
  multiplier: string | null;
};

type RoundPublic = {
  roundName: string;
  trackName: string;
  roundPoints: number;
  sessions: SessionPublic[];
};

type ChampionshipPublic = {
  championshipName: string;
  totalPoints: number;
  positionInChampionship: number | null;
  rounds: RoundPublic[];
};

type DriverResponse = {
  driver: DriverPublic;
  performance?: {
    championships: ChampionshipPublic[];
  };
};

async function getDriver(id: string): Promise<DriverResponse | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/public/drivers/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

function formatMultiplier(multiplier: string | null): string {
  if (!multiplier) return "—";
  switch (multiplier) {
    case "NORMAL":
      return "1x";
    case "HALF":
      return "0.5x";
    case "DOUBLE":
      return "2x";
    default:
      return multiplier;
  }
}

export default async function DriverPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getDriver(params.id);
  if (!data) notFound();

  const { driver, performance } = data;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/drivers"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to drivers
        </Link>

        <header className="flex flex-col sm:flex-row gap-6 items-start mb-10">
          <div className="shrink-0">
            {driver.profileImageUrl ? (
              <div className="relative w-40 h-40 rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={driver.profileImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>
            ) : (
              <div
                className="w-40 h-40 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center"
                aria-hidden
              >
                <svg
                  className="w-16 h-16 text-red-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {driver.fullName}
            </h1>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Driver info
          </h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-3">
            <p className="text-gray-700">
              <span className="font-medium text-gray-500">Weight:</span>{" "}
              {driver.weight != null ? `${driver.weight} kg` : "—"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-500">Height:</span>{" "}
              {driver.height != null ? `${driver.height} cm` : "—"}
            </p>
            {driver.notes != null && driver.notes.trim() !== "" && (
              <div>
                <p className="font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-gray-700 whitespace-pre-wrap">{driver.notes}</p>
              </div>
            )}
          </div>
        </section>

        {performance &&
          performance.championships &&
          performance.championships.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Performance
              </h2>
              <div className="space-y-8">
                {performance.championships.map((champ) => (
                  <div
                    key={champ.championshipName}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {champ.championshipName}
                    </h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-500">
                          Total points:
                        </span>{" "}
                        {formatPoints(champ.totalPoints)}
                      </p>
                      {champ.positionInChampionship != null && (
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-500">
                            Position:
                          </span>{" "}
                          {champ.positionInChampionship}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {champ.rounds.map((round) => (
                        <div
                          key={`${round.roundName}-${round.trackName}`}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <p className="font-medium text-gray-900">
                            {round.roundName} – {round.trackName}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            Round points: {formatPoints(round.roundPoints)}
                          </p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {round.sessions.map((s, i) => (
                              <li key={i}>
                                {getSessionDisplayName(s.sessionType, s.group)}: P
                                {s.position}{" "}
                                – {formatPoints(s.points)} pts{" "}
                                {s.multiplier &&
                                  s.multiplier !== "NORMAL" &&
                                  `(${formatMultiplier(s.multiplier)})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
