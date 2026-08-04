import { useCallback, useEffect, useState } from 'react';
import { getLookups } from '../api/lookups';
import { errorMessage, isAbort } from '../api/client';
import type { Lookups } from '../api/schemas';

/** Catálogos estáticos: se piden una vez por sesión, no por montaje del form. */
let cache: Lookups | null = null;

export function useLookups() {
  const [lookups, setLookups] = useState<Lookups | null>(cache);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (cache) return;

    const controller = new AbortController();
    setError(null);

    getLookups(controller.signal)
      .then((result) => {
        cache = result;
        setLookups(result);
      })
      .catch((err) => {
        if (isAbort(err)) return;
        setError(errorMessage(err));
      });

    return () => controller.abort();
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return { lookups, error, retry };
}
