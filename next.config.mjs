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
      {
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
