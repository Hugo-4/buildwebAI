/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // three/examples (Draco, GLTF) sont publiés en ESM : on laisse Next les transpiler
  transpilePackages: ["three"],
};
export default nextConfig;
