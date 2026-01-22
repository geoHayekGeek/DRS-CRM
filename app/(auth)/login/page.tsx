"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { theme } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 150));
        window.location.href = "/admin";
      } else {
        setError("Login failed");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={{ backgroundColor: theme.colors.primary.dark }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/DRS-black.png"
                alt="DRS Cup 2026"
                width={160}
                height={40}
                className="h-auto"
                priority
              />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold tracking-tight"
                style={{ color: theme.colors.primary.dark }}
              >
                DRS Cup 2026
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-2">
                Championship Management System
              </p>
            </div>
            <p className="text-gray-500 text-xs pt-2">
              Admin Access Only
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{ 
                    '--tw-ring-color': theme.colors.primary.red 
                  } as React.CSSProperties & { '--tw-ring-color': string }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`}
                  onBlur={(e) => e.currentTarget.style.boxShadow = ''}
                  placeholder="admin@drs-cup.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{ 
                    '--tw-ring-color': theme.colors.primary.red 
                  } as React.CSSProperties & { '--tw-ring-color': string }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`}
                  onBlur={(e) => e.currentTarget.style.boxShadow = ''}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div 
                className="bg-red-50 border-l-4 p-4 rounded-r-lg"
                style={{ borderLeftColor: theme.colors.primary.red }}
              >
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.primary.red }}
                >
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3.5 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]"
              style={{ 
                backgroundColor: theme.colors.primary.red,
                '--tw-ring-color': theme.colors.primary.red
              } as React.CSSProperties & { '--tw-ring-color': string }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#A01516')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            © 2026 DRS Cup Championship. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
