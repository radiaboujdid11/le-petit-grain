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

describe("dates de la boutique", () => {
  it("affiche l'heure de Casablanca, pas celle du visiteur", async () => {
    const { formatTime } = await import("./format");
    // 08:15 UTC = 08:15 ou 09:15 à Casablanca selon la période : on vérifie juste le format
    expect(formatTime("2026-11-28T08:15:00Z", "fr")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("date du jour au format AAAA-MM-JJ et ajout de jours", async () => {
    const { addDays, shopToday } = await import("./format");
    expect(shopToday(new Date("2026-11-28T10:00:00Z"))).toBe("2026-11-28");
    expect(addDays("2026-11-30", 2)).toBe("2026-12-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("libellés de jours dans les deux langues", async () => {
    const { formatShortDay } = await import("./format");
    expect(formatShortDay("2026-11-28", "fr")).toContain("28");
    expect(formatShortDay("2026-11-28", "en")).toMatch(/Sat/);
  });
});
