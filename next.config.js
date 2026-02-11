/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit loads font files from disk; must run from node_modules so paths resolve
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
};

module.exports = nextConfig;
