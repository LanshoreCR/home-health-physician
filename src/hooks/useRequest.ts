import { useCallback, useEffect, useState } from 'react';
import { getRequest } from '../api/physicianRequests';
import { errorMessage, isAbort } from '../api/client';
import type { PhysicianRequest } from '../data/types';

export function useRequest(id: number | null) {
  const [request, setRequest] = useState<PhysicianRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (id === null) {
      setRequest(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getRequest(id, controller.signal)
      .then((result) => {
        setRequest(result);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbort(err)) return;
        setError(errorMessage(err));
        setRequest(null);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { request, loading, error, refetch };
}
