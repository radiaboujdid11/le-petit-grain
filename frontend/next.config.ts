import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Branche next-intl sur Next.js, avec notre fichier de configuration des langues
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Qualités de compression autorisées pour <Image quality={…}>.
    // 75 = défaut ; 90 = photos produits et hero (moins de perte de netteté).
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
