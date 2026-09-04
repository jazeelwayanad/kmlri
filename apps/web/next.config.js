/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  },
  async redirects() {
    return [
      {
        source: '/admin/login',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/signin',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/signup',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
