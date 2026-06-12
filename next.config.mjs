/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Official source images can be allow-listed here once licensed URLs are configured.
  images: { remotePatterns: [] },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" }
        ]
      }
    ];
  }
};

export default nextConfig;
