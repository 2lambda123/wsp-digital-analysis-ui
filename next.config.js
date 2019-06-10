const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const path = require('path')

// Pull in .env
require('dotenv').config()

const env = {
  API_URL: process.env.API_URL,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  GRAPHHOPPER_API_KEY: process.env.GRAPHHOPPER_API_KEY,
  MAPTILER_KEY: process.env.MAPTILER_KEY
}

// Log env for sanity
console.log(env)

module.exports = withBundleAnalyzer({
  target: 'serverless',
  env,
  webpack: config => {
    // Allow `import 'lib/message'`
    config.resolve.alias['lib'] = path.join(__dirname, 'lib')

    // ESLint on build
    config.module.rules.push({
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    })

    return config
  }
})
