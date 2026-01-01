/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for pages using client-side theme
  experimental: {
    // Let pages opt into dynamic rendering as needed
  },
  // Force all pages to be dynamic (no static generation)
  // This is needed because next-themes requires client-side rendering
  output: 'standalone',
};

module.exports = nextConfig;
