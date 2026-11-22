"use client";
// true dans le navigateur (après l'hydratation), false pendant le rendu serveur.
// useSyncExternalStore évite d'appeler setState dans un useEffect (règle de React 19).
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
