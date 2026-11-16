// Tests de cohérence des données des parfums. Lancer avec : npm test
import { describe, expect, it } from "vitest";
import { cupSizes, flavors } from "./flavors";

const HEX = /^#[0-9A-Fa-f]{6}$/; // couleur au format #RRGGBB

describe("flavors", () => {
  it("contient 7 parfums aux identifiants uniques", () => {
    expect(flavors).toHaveLength(7);
    const ids = flavors.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(flavors)("$id : textes remplis dans les deux langues", (flavor) => {
    for (const text of [flavor.name, flavor.tagline, flavor.description]) {
      expect(text.fr.trim()).not.toBe("");
      expect(text.en.trim()).not.toBe("");
    }
  });

  it.each(flavors)("$id : couleurs valides", (flavor) => {
    const { syrup, ...others } = flavor.colors;
    if (syrup !== null) expect(syrup).toMatch(HEX);
    for (const color of Object.values(others)) expect(color).toMatch(HEX);
  });

  it.each(flavors)("$id : les couches tiennent dans le gobelet (≤ 90 %)", (flavor) => {
    const { coldBrew, milk, espresso } = flavor.heights;
    for (const h of [coldBrew, milk, espresso]) expect(h).toBeGreaterThan(0);
    // 10 % libres en haut pour la glace et le dôme
    expect(coldBrew + milk + espresso).toBeLessThanOrEqual(0.9);
  });

  it.each(flavors)("$id : profil de goût entre 0 et 100", (flavor) => {
    for (const value of Object.values(flavor.taste)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it.each(flavors)("$id : prix en centimes entiers, taille S toujours positive", (flavor) => {
    expect(Number.isInteger(flavor.priceCents)).toBe(true);
    const smallest = Math.min(...cupSizes.map((s) => s.deltaCents));
    expect(flavor.priceCents + smallest).toBeGreaterThan(0);
  });
});
