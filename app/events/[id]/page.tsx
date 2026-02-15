import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type EventPublic = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  status: "ONGOING" | "UPCOMING" | "PAST";
  images: { id: string; url: string }[];
};

async function getEvent(id: string): Promise<EventPublic | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/public/events/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href="/landing"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Back to Home
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <header className="mb-6">
            <div className="mb-4">
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded uppercase ${
                  event.status === "ONGOING"
                    ? "bg-green-100 text-green-800"
                    : event.status === "UPCOMING"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {event.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            <p className="text-gray-900 font-medium">
              {formatDateTime(event.startsAt)}
            </p>
            {event.location && (
              <p className="text-gray-700 mt-1">{event.location}</p>
            )}
          </header>

          {event.description && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Gallery
            </h2>
            {(event.images?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No media available</p>
            )}
          </section>
        </div>
      </article>
    </div>
  );
}
