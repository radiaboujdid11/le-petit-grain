// Les langues du site et leurs URL : /fr/… et /en/…
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr", // si la langue du navigateur n'est ni fr ni en
});
