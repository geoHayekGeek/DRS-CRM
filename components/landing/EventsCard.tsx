import React from "react";
import Link from "next/link";

export type FeaturedEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  status: "ONGOING" | "UPCOMING";
};

type Props = {
  events: FeaturedEvent[];
};

function formatEventDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const EventsCard = ({ events }: Props) => {
  const list = Array.isArray(events) ? events : [];
  return (
    <div className="relative rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden p-6 transform rotate-[-2deg] hover:rotate-0 transition duration-500 ease-out">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 tracking-tight">Events</span>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-gray-500 text-sm">No upcoming events.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${
                      event.status === "ONGOING" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status === "ONGOING" ? "Ongoing" : "Upcoming"}
                  </span>
                </div>
                <p className="font-bold text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500 mt-1">{formatEventDate(event.startsAt)}</p>
                {event.location && (
                  <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsCard;
