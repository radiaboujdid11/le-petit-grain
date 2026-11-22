// Proxy (anciennement « middleware » avant Next.js 16) : s'exécute AVANT chaque page.
// next-intl s'en sert pour :
// - rediriger « / » vers /fr ou /en selon la langue du navigateur (ou le dernier choix mémorisé) ;
// - mémoriser la langue choisie dans un cookie.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Toutes les pages, SAUF : /api (backend), /_next (fichiers internes) et les fichiers
  // avec une extension (images, icon.svg…)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
