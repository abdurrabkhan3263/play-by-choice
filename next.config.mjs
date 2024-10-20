/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "i.scdn.co",
      },
      {
        hostname: "mosaic.scdn.co",
      },
    ],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
