import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Route handlers that read cookies()/headers() bail out of prerendering by
  // throwing. That is expected; keep it out of the build log.
  experimental: { hideLogsAfterAbort: true },
};

export default nextConfig;
