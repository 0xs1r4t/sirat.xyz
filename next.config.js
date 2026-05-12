/** @type {import('next').NextConfig} */

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

// const nextConfig = withBundleAnalyzer();
/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "media1.giphy.com", pathname: "/**" },
      { protocol: "https", hostname: "i.giphy.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
      { protocol: "https", hostname: "icons.duckduckgo.com", pathname: "/**" },
      { protocol: "https", hostname: "www.youtube.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@graphics": path.resolve(process.cwd(), "src/graphics"),
    };

    config.module.rules.push({
      test: /\.(glsl|vert|frag|vs|fs)$/,
      exclude: /node_modules/,
      use: ["raw-loader"],
    });

    return config;
  },
};

module.exports = nextConfig;
