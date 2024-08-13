const _getPublicEnv = (prefix) => {
  const envs = process.env;
  const res = {};

  Object.keys(envs).forEach((k) => {
    if (k.startsWith(prefix)) {
      res[k] = envs[k];
    }
  });

  return res;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/view/gnfd-press-" + process.env.BUCKET_NAME,
  publicRuntimeConfig: {
    ..._getPublicEnv("NEXT_PUBLIC_"),
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: "/view/gnfd-press-" + process.env.BUCKET_NAME,
};

module.exports = nextConfig;
