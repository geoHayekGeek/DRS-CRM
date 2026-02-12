import React from 'react';
import Link from 'next/link';

export type FeaturedChampionship = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
};

export type StandingRow = {
  fullName: string;
  totalPoints: number;
};

type Props = {
  championship: FeaturedChampionship | null;
  hasStandings: boolean;
  standings?: StandingRow[];
};

const Championship = ({ championship, hasStandings, standings = [] }: Props) => {
  if (championship === null) {
    return (
      <section className="py-20 border-t border-gray-200" id="championship">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-12 text-center max-w-md">
              <p className="text-gray-900 text-lg">No championships available</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const displayName = championship.name ?? '-';
  const hasStandingsData = hasStandings && Array.isArray(standings) && standings.length > 0;

  return (
    <section className="py-20 border-t border-gray-200" id="championship">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Championship</h2>
            <p className="mt-2 text-red-600">{displayName}</p>
          </div>
          <Link
            href="/championships"
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition flex items-center gap-1"
          >
            View All Championships
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Driver Standings</h3>
              </div>
              <div className="overflow-x-auto">
                {hasStandingsData ? (
                  <table className="w-full text-left text-sm text-gray-900">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700">
                      <tr>
                        <th className="px-6 py-3">Pos</th>
                        <th className="px-6 py-3">Driver</th>
                        <th className="px-6 py-3 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {standings.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{row.fullName}</td>
                          <td className="px-6 py-4 text-right font-bold text-black">{row.totalPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-8 text-center text-gray-700">
                    —
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Championship;
