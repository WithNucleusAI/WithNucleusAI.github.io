/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
  output: 'standalone', // This is key for Cloud Run/Docker
};

export default nextConfig;