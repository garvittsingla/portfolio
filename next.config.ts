import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/blog",
        destination: "/blog/index.html",
      },
      {
        source: "/blogs",
        destination: "/blog/index.html",
      },
      {
        source: "/atom.xml",
        destination: "/blog/atom.xml",
      },
      {
        source: "/rss.xml",
        destination: "/blog/rss.xml",
      },
      // Matches article slugs without dots (e.g. /blog/http-server-in-cpp)
      {
        source: "/blog/:slug([a-zA-Z0-9_-]+)",
        destination: "/blog/:slug/index.html",
      },
      {
        source: "/blogs/:slug([a-zA-Z0-9_-]+)",
        destination: "/blog/:slug/index.html",
      },
    ];
  },
};

export default nextConfig;
