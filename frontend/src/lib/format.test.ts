// Tests de formatPrice. Lancer avec : npm test
import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formate en français avec une virgule et « DH »", () => {
    expect(formatPrice(2500, "fr")).toBe("25,00 DH");
  });

  it("formate en anglais avec un point et « MAD »", () => {
    expect(formatPrice(2500, "en")).toBe("25.00 MAD");
  });

  it("garde toujours deux décimales", () => {
    expect(formatPrice(3550, "fr")).toBe("35,50 DH");
    expect(formatPrice(0, "en")).toBe("0.00 MAD");
  });

  it("sépare les milliers (utile pour le tableau de bord)", () => {
    // En français, le séparateur des milliers est une espace fine insécable ( )
    expect(formatPrice(125000, "fr")).toBe("1 250,00 DH");
    expect(formatPrice(125000, "en")).toBe("1,250.00 MAD");
  });
});
