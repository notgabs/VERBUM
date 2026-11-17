import type { NextConfig } from "next";

/**
 * Site 100% estático (`next build` gera a pasta `out/`), pronto para GitHub Pages, Cloudflare Pages ou Netlify.
 * No GitHub Pages o site fica em /<repositório>; o workflow passa esse prefixo em NEXT_PUBLIC_BASE_PATH.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
