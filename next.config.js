/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      "http://10.179.235.220:3000",
      "http://localhost:3000"
    ]
  }
};

module.exports = nextConfig;
