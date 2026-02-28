/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit loads font files from disk; must run from node_modules so paths resolve
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: "/api/serve-upload/:path*" },
    ];
  },
  async redirects() {
    return [
      { source: "/landing", destination: "/", permanent: false },
      { source: "/landing/about", destination: "/about", permanent: false },
      { source: "/landing/gallery", destination: "/gallery", permanent: false },
      { source: "/landing/contact", destination: "/contact", permanent: false },
      { source: "/landing/championship", destination: "/championships", permanent: false },
      { source: "/landing/championship/:path*", destination: "/championships", permanent: false },
      { source: "/landing/race", destination: "/championships", permanent: false },
    ];
  },
};

module.exports = nextConfig;
