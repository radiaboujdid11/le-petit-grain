"use client";
// État du panier partagé par tout le site, sauvegardé dans le navigateur (localStorage) :
// le panier survit à un rechargement de page et se synchronise entre onglets.
//
// Le panier est un petit « magasin externe » lu avec useSyncExternalStore, l'outil React
// prévu pour les données qui vivent hors de React (comme localStorage).

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { addToCart, type CartLine, countItems, parseCart, removeFromCart, setQuantity } from "@/lib/cart";
import { useHydrated } from "@/lib/use-hydrated";

const STORAGE_KEY = "lpg-cart";
const EMPTY: CartLine[] = [];

// ---------- Magasin (hors React)
let current: CartLine[] | null = null; // lu à la première demande
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (current === null) {
    try {
      current = parseCart(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      current = []; // stockage bloqué (navigation privée…) : panier en mémoire
    }
  }
  return current;
}

function write(next: CartLine[]) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : le panier reste en mémoire */
  }
  listeners.forEach((notify) => notify());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Un autre onglet a modifié le panier : on relit
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      current = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ---------- Contexte React
type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean; // false pendant le rendu serveur (panier inconnu)
  add: (slug: string, quantity?: number) => void;
  update: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const actions = {
  add: (slug: string, quantity = 1) => write(addToCart(read(), slug, quantity)),
  update: (slug: string, quantity: number) => write(setQuantity(read(), slug, quantity)),
  remove: (slug: string) => write(removeFromCart(read(), slug)),
  clear: () => write([]),
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useHydrated();
  const value = useMemo(() => ({ lines, count: countItems(lines), ready, ...actions }), [lines, ready]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return context;
}
