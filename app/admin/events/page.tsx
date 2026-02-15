"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Event {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

function getEventStatus(event: Event): "Upcoming" | "Ongoing" | "Past" {
  const now = new Date();
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;

  if (end && now >= start && now <= end) {
    return "Ongoing";
  }
  if (start > now) {
    return "Upcoming";
  }
  return "Past";
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
      setError("");
    } catch (err) {
      const errorMessage = "Failed to load events";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const deleteToast = toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">Delete {title}?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeletingId(id);
                  const response = await fetch(`/api/admin/events/${id}`, {
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    throw new Error("Failed to delete event");
                  }

                  toast.success("Event deleted successfully");
                  await fetchEvents();
                } catch (err) {
                  toast.error("Failed to delete event");
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-3 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs font-semibold rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "#1F2937",
          color: "#F9FAFB",
          border: "1px solid #374151",
        },
      }
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            Events
          </h1>
          <button
            onClick={() => router.push("/admin/events/new")}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Add Event
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 rounded-r-lg" style={{ borderLeftColor: theme.colors.primary.red }}>
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-gray-300">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-300">No events found. Add your first event to get started.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Starts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ends
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(event.startsAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.endsAt ? formatDateTime(event.endsAt) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded uppercase ${
                            status === "Ongoing"
                              ? "bg-green-100 text-green-800"
                              : status === "Upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                            aria-label={`View ${event.title}`}
                            title="View event"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                            aria-label={`Edit ${event.title}`}
                            title="Edit event"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id, event.title)}
                            disabled={deletingId === event.id}
                            className="p-1.5 text-red-600 hover:text-red-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${event.title}`}
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
