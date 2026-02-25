/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // 兼容旧路径
  async rewrites() {
    return [
      {
        source: '/new_product/:path*',
        destination: '/api/legacy-image?path=new_product/:path*',
      },
      {
        source: '/hot_product/:path*',
        destination: '/api/legacy-image?path=hot_product/:path*',
      },
      {
        source: '/typical_product/:path*',
        destination: '/api/legacy-image?path=typical_product/:path*',
      },
    ];
  },
};
export default nextConfig;
