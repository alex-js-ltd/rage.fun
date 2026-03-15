import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    formats: ["image/webp"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "img-v1.raydium.io",
        port: "",
        pathname: "/icon/**",
      },

      {
        protocol: "https",
        hostname: "vn5d3lsmmr2noe9p.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "vqcczuygjg63d4lo.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https", // Add the protocol for loremflickr
        hostname: "loremflickr.com", // Add the hostname for loremflickr
        port: "",
        pathname: "/**", // Allow all paths under this hostname
      },

      {
        protocol: "https",
        hostname: "picsum.photos", // Add picsum.photos
        port: "",
        pathname: "/**", // Allow all paths under this domain
      },

      {
        protocol: "https",
        hostname: "indigo-adverse-vicuna-777.mypinata.cloud", // Add picsum.photos
        port: "",
        pathname: "/**", // Allow all paths under this domain
      },

      {
        protocol: "https",
        hostname: "violet-giant-deer-1.mypinata.cloud", // Add picsum.photos
        port: "",
        pathname: "/**", // Allow all paths under this domain
      },

      {
        protocol: "https",
        hostname: "cdn.discordapp.com", // Add picsum.photos
        port: "",
        pathname: "/**", // Allow all paths under this domain
      },
    ],
  },
};

export default nextConfig;
