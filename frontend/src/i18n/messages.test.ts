// Vérifie que fr.json et en.json contiennent exactement les mêmes clés :
// impossible d'oublier un texte dans une des deux langues. Lancer avec : npm test
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

// Transforme { Nav: { menu: "…" } } en ["Nav.menu", …] (liste « à plat » des clés)
function flattenKeys(object: object, prefix = ""): string[] {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flattenKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("traductions", () => {
  it("fr et en ont les mêmes clés", () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(fr).sort());
  });

  it("aucun texte vide", () => {
    for (const messages of [fr, en]) {
      const values = flattenKeys(messages).map((path) =>
        path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages),
      );
      expect(values.every((value) => typeof value === "string" && value.trim() !== "")).toBe(true);
    }
  });
});
