// Tests de cohérence des données des boissons. Lancer avec : npm test
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cupSizes, flavors } from "./flavors";

const HEX = /^#[0-9A-Fa-f]{6}$/; // couleur au format #RRGGBB

describe("flavors", () => {
  it("contient 6 boissons aux identifiants uniques", () => {
    expect(flavors).toHaveLength(6);
    const ids = flavors.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(flavors)("$id : textes remplis dans les deux langues", (flavor) => {
    for (const text of [flavor.name, flavor.tagline, flavor.description]) {
      expect(text.fr.trim()).not.toBe("");
      expect(text.en.trim()).not.toBe("");
    }
  });

  it.each(flavors)("$id : la photo existe dans public/", (flavor) => {
    // « /images/… » sur le site = « public/images/… » sur le disque
    expect(existsSync(`public${flavor.image}`)).toBe(true);
  });

  it.each(flavors)("$id : couleur d'accent valide", (flavor) => {
    expect(flavor.accent).toMatch(HEX);
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
