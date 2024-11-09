/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/v1/:path*', // Rewrite rule for the first microservice
        destination: 'http://localhost:4000/v1/:path*', // Destination for service 1
      },
      {
        source: '/v2/:path*', // Rewrite rule for the second microservice
        destination: 'http://68.183.90.32:3000/v2/:path*', // Destination for service 2
      }
      // Add more routes as needed
    ];
  },
};

export default nextConfig;