"use client";
// Petit « hook » React pour charger des données de l'API dans un Client Component :
//   const { data, error, loading, reload } = useApi<Product[]>("/products");
// path = null : rien n'est chargé. La langue courante est envoyée automatiquement.
//
// L'état « en chargement » n'est pas stocké : il est DÉDUIT (la réponse reçue
// correspond-elle à la requête actuelle ?). Aucun setState synchrone dans l'effet.

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { apiRequest, ClientApiError } from "./client-api";
import type { Locale } from "./format";

type State<T> = { key: string | null; data: T | null; error: ClientApiError | null };

export function useApi<T>(path: string | null) {
  const locale = useLocale() as Locale;
  const [version, setVersion] = useState(0); // incrémenté par reload()
  const key = path === null ? null : `${locale}|${version}|${path}`;
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (path === null || key === null) return;
    let cancelled = false; // ignore une réponse arrivée après un changement de requête
    apiRequest<T>(path, { locale })
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch((error: ClientApiError) => !cancelled && setState({ key, data: null, error }));
    return () => {
      cancelled = true;
    };
  }, [key, path, locale]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return {
    data: state.data, // dernière donnée reçue (reste affichée pendant un rechargement)
    error: state.key === key ? state.error : null,
    loading: key !== null && state.key !== key,
    reload,
  };
}
