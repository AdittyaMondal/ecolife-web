import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Required by the Dockerfile's runner stage: emits a self-contained server.js
   * alongside only the node_modules Next actually traced, which is what keeps
   * the runtime image free of pnpm's store and every devDependency.
   */
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  // Route handlers that read cookies()/headers() bail out of prerendering by
  // throwing. That is expected; keep it out of the build log.
  experimental: { hideLogsAfterAbort: true },
};

export default nextConfig;
