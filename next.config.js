/** @type {import('next').NextConfig} */

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

// const nextConfig = withBundleAnalyzer();

const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media1.giphy.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.giphy.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
