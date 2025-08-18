/** @type {import('next').NextConfig} */
const nextConfig = {
  // Work around SWC compiler crashes on some Windows-encoded sources / unicode strings
  swcMinify: false,
};

export default nextConfig;
