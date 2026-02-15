"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.status === 403) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setError("");
    } catch (err) {
      const errorMessage = "Failed to load users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setFormLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setFormLoading(false);
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim() || undefined,
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create admin");
        setFormLoading(false);
        return;
      }

      toast.success("Admin created successfully");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    const deleteToast = toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">Delete {email}?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeletingId(id);
                  const response = await fetch(`/api/admin/users/${id}`, {
                    method: "DELETE",
                  });
                  const data = await response.json();

                  if (!response.ok) {
                    toast.error(data.error || "Failed to delete user");
                    setDeletingId(null);
                    return;
                  }

                  toast.success("User deleted successfully");
                  await fetchUsers();
                } catch (err) {
                  toast.error("Failed to delete user");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            Users
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            {showForm ? "Cancel" : "Add Admin"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                />
                <p className="mt-1 text-xs text-gray-600">At least 6 characters</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                />
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="min-h-[44px] px-6 py-2 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.colors.primary.red }}
                onMouseEnter={(e) => !formLoading && (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => !formLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {formLoading ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </div>
        )}

        {error && (
          <div
            className="mb-4 p-4 bg-red-50 border-l-4 rounded-r-lg"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-600">No users found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Full name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded uppercase ${
                          user.role === "SUPER_ADMIN"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== "SUPER_ADMIN" && (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={deletingId === user.id}
                          className="p-1.5 text-red-600 hover:text-red-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${user.email}`}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
