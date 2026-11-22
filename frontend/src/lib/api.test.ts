// Tests du client de l'API. « fetch » est remplacé par une fausse version (mock) :
// les tests ne dépendent pas d'un vrai backend. Lancer avec : npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchCategories, fetchProduct, productsPath } from "./api";

// Fabrique une fausse réponse HTTP
function mockFetch(status: number, body: unknown) {
  const fake = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: async () => body,
  });
  vi.stubGlobal("fetch", fake);
  return fake;
}

afterEach(() => vi.unstubAllGlobals());

describe("productsPath", () => {
  it("sans filtre", () => {
    expect(productsPath()).toBe("/products");
  });

  it("n'ajoute que les filtres demandés", () => {
    expect(productsPath({ category: "croissants", nut_free: true, bestseller: undefined })).toBe(
      "/products?category=croissants&nut_free=true",
    );
  });
});

describe("apiFetch", () => {
  it("envoie la langue dans Accept-Language et appelle /api/v1", async () => {
    const fake = mockFetch(200, [{ slug: "coffee", name: "Coffee" }]);
    const data = await fetchCategories("en");

    expect(data).toEqual([{ slug: "coffee", name: "Coffee" }]);
    const [url, options] = fake.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/v1/categories");
    expect(options.headers["Accept-Language"]).toBe("en");
  });

  it("transforme une erreur du backend en ApiError { code, message }", async () => {
    mockFetch(500, { code: "BOOM", message: "Erreur serveur" });
    await expect(fetchCategories("fr")).rejects.toMatchObject({
      status: 500,
      code: "BOOM",
      message: "Erreur serveur",
    });
    await expect(fetchCategories("fr")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("fetchProduct", () => {
  it("renvoie null pour un produit introuvable (404)", async () => {
    mockFetch(404, { code: "PRODUCT_NOT_FOUND", message: "…" });
    expect(await fetchProduct("fr", "licorne")).toBeNull();
  });

  it("encode le slug dans l'URL", async () => {
    const fake = mockFetch(200, {});
    await fetchProduct("fr", "a b");
    expect(fake.mock.calls[0][0]).toBe("http://localhost:8000/api/v1/products/a%20b");
  });
});
