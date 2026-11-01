/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/tools/sns-ai", destination: "/tools/sns-ai/index.html", permanent: false }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};
export default nextConfig;
