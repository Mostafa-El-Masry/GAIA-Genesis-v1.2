// next.config.mjs
import path from 'node:path';

const nextConfig = {
  typedRoutes: true,
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'app'); // '@/hooks/*' -> app/hooks/*
    return config;
  },
};

export default nextConfig;
