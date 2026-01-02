import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Disable static optimization for pages using client-side theme
  experimental: {
    // Let pages opt into dynamic rendering as needed
  },
  // Force all pages to be dynamic (no static generation)
  // This is needed because next-themes requires client-side rendering
  output: 'standalone',
};

export default withBundleAnalyzer(nextConfig);
