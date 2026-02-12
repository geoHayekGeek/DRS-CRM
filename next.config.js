/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit loads font files from disk; must run from node_modules so paths resolve
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
  async redirects() {
    return [
      { source: "/landing/championship", destination: "/championships", permanent: false },
      { source: "/landing/championship/:path*", destination: "/championships", permanent: false },
      { source: "/landing/race", destination: "/championships", permanent: false },
    ];
  },
};

module.exports = nextConfig;
