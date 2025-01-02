/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'dist',
  webpack: (config) => {
    config.externals.push({
      'zlib-sync': 'zlib-sync',
    })
    return config
  },
}

module.exports = nextConfig
