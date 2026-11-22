// Toute adresse inconnue (/fr/n-importe-quoi) affiche la page 404 du site (not-found.tsx).
import { notFound } from "next/navigation";

export default function CatchAll() {
  notFound();
}
