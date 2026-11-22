import { describe, expect, it } from "vitest";
import { addToCart, countItems, parseCart, removeFromCart, setQuantity, subtotalCents } from "./cart";

describe("panier", () => {
  it("ajoute un produit, puis cumule la quantité", () => {
    let cart = addToCart([], "espresso");
    cart = addToCart(cart, "espresso", 2);
    expect(cart).toEqual([{ slug: "espresso", quantity: 3 }]);
  });

  it("ne dépasse jamais 20 par article", () => {
    expect(addToCart([], "msemen", 50)[0].quantity).toBe(20);
  });

  it("quantité 0 = article retiré", () => {
    const cart = setQuantity([{ slug: "espresso", quantity: 2 }], "espresso", 0);
    expect(cart).toEqual([]);
  });

  it("retire un article", () => {
    const cart = [{ slug: "a", quantity: 1 }, { slug: "b", quantity: 2 }];
    expect(removeFromCart(cart, "a")).toEqual([{ slug: "b", quantity: 2 }]);
  });

  it("compte les articles et calcule le sous-total", () => {
    const cart = [{ slug: "espresso", quantity: 2 }, { slug: "msemen", quantity: 3 }];
    expect(countItems(cart)).toBe(5);
    expect(subtotalCents(cart, { espresso: 1500, msemen: 800 })).toBe(5400);
  });

  it("ignore un panier sauvegardé corrompu", () => {
    expect(parseCart("pas du json")).toEqual([]);
    expect(parseCart('[{"slug":"a","quantity":-1},{"slug":"b","quantity":2},{"x":1}]')).toEqual([
      { slug: "b", quantity: 2 },
    ]);
  });
});
