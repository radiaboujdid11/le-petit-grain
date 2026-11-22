// Adresse publique du site, utilisée pour le sitemap, robots.txt et les images de partage.
// 1. SITE_URL si on la définit (ex. futur nom de domaine : https://lepetitgrain.ma)
// 2. sinon l'adresse de production fournie automatiquement par Vercel
// 3. sinon (en local) http://localhost:3000
export const SITE_URL =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
