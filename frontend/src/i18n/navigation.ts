// Versions « multilingues » des outils de navigation de Next.js.
// <Link href="/menu"> mène automatiquement à /fr/menu ou /en/menu selon la langue courante.
// À utiliser PARTOUT à la place de next/link.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
