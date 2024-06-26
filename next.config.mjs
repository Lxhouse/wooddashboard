/** @type {import('next').NextConfig} */

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = '';
let basePath = '';

if (isGithubActions) {
  // 去掉 `<owner>/`
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '');

  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig = {
  basePath,
  assetPrefix,
  output: 'export',
  trailingSlash: true,
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'avatars.githubusercontent.com',
  //     },
  //   ],
  // },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  eslint: {
    ignoreDuringBuilds: true, // 忽略 eslint 检查
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略 TypeScript 检查
  },
};

export default nextConfig;
