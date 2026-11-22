// Logique du panier, en fonctions PURES (sans React) : faciles à tester.
// Le panier ne contient que des slugs et des quantités : les prix viennent toujours
// du backend, qui les recalcule à la commande.

export type CartLine = { slug: string; quantity: number };

export const MAX_QUANTITY = 20; // même limite que le backend

export function addToCart(cart: CartLine[], slug: string, quantity = 1): CartLine[] {
  const existing = cart.find((line) => line.slug === slug);
  if (existing) return setQuantity(cart, slug, existing.quantity + quantity);
  return [...cart, { slug, quantity: Math.min(quantity, MAX_QUANTITY) }];
}

export function setQuantity(cart: CartLine[], slug: string, quantity: number): CartLine[] {
  if (quantity <= 0) return removeFromCart(cart, slug);
  return cart.map((line) =>
    line.slug === slug ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) } : line,
  );
}

export function removeFromCart(cart: CartLine[], slug: string): CartLine[] {
  return cart.filter((line) => line.slug !== slug);
}

export function countItems(cart: CartLine[]): number {
  return cart.reduce((total, line) => total + line.quantity, 0);
}

// Sous-total pour l'affichage, à partir des prix actuels du menu (en centimes)
export function subtotalCents(cart: CartLine[], prices: Record<string, number>): number {
  return cart.reduce((total, line) => total + (prices[line.slug] ?? 0) * line.quantity, 0);
}

// Relit un panier sauvegardé en ignorant toute donnée invalide (localStorage modifié…)
export function parseCart(raw: string | null): CartLine[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (line): line is CartLine =>
          typeof line?.slug === "string" && Number.isInteger(line?.quantity) && line.quantity > 0,
      )
      .map((line) => ({ slug: line.slug, quantity: Math.min(line.quantity, MAX_QUANTITY) }));
  } catch {
    return [];
  }
}
