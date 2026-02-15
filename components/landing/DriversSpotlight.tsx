import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type SpotlightDriver = {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
};

type Props = {
  drivers: SpotlightDriver[];
};

const DriversSpotlight = ({ drivers }: Props) => {
  if (drivers.length === 0) {
    return null;
  }

  return (
    <section className="py-24 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Top Drivers</h2>
          </div>
          <Link
            href="/drivers"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-red-600 transition group"
          >
            View All Drivers
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {drivers.map((driver) => (
            <Link key={driver.id} href={`/drivers/${driver.id}`} className="group block h-full">
              <div className="relative h-full flex flex-col bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-200 border-b-4 border-red-500">
                <div className="h-48 w-full bg-red-600 relative overflow-hidden flex items-end justify-center">
                  {driver.profileImageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={driver.profileImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-800/20 backdrop-blur-sm rounded-t-full border-4 border-white/10 relative z-10 translate-y-4" />
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                    {driver.fullName}
                  </h3>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                    {driver.weight != null && (
                      <p className="text-sm text-gray-600">
                        Weight: {driver.weight} kg
                      </p>
                    )}
                    {driver.height != null && (
                      <p className="text-sm text-gray-600">
                        Height: {driver.height} cm
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4 flex justify-end">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                      View profile
                    </span>
                    <svg
                      className="w-4 h-4 ml-1 inline text-gray-400 group-hover:text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link href="/drivers" className="block w-full py-4 bg-black text-white text-center rounded-xl font-bold hover:bg-gray-800 transition">
            View All Drivers
          </Link>
        </div>

      </div>
    </section>
  );
};

export default DriversSpotlight;
