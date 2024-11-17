/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'bcryptjs']
    return config
  },
  serverExternalPackages: ['bcryptjs']
}

module.exports = nextConfig
