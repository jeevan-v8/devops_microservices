/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: 'http://auth-service:4000/v1/:path*', // Using auth-service service name
      },
      {
        source: '/notes/:path*',
        destination: 'http://notes-service:3001/:path*', // Using notes-service service name
      },
      {
        source: '/products/:path*',
        destination: 'http://product-service:3002/:path*', // Using product-service
      }
      // Add more routes as needed
    ];
  }
};

export default nextConfig;
