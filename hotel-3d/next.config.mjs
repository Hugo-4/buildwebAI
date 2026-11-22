/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // le dépôt parent a son propre package-lock : on fixe la racine du projet
  outputFileTracingRoot: import.meta.dirname,
  images: { formats: ["image/avif", "image/webp"] },
  // three/examples (Draco, GLTF) sont publiés en ESM : on laisse Next les transpiler
  transpilePackages: ["three"],
};
export default nextConfig;
