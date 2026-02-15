/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@babywearing/db"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
