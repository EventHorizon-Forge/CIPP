const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    turbopackFileSystemCacheForDev: false,
    turbopackMemoryLimit: 4096,
  },
  async redirects() {
    return []
  },
  async rewrites() {
    if (isProd) return []
    const origin = process.env.CIPP_LOCAL_API_ORIGIN || 'http://127.0.0.1:7071'
    return [{ source: '/api/:path*', destination: `${origin}/api/:path*` }]
  },
  ...(isProd ? { output: 'export' } : {}),
  distDir: './out',
}

module.exports = config
