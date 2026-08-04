import { useCallback, useEffect, useState } from 'react';
import { listRequests } from '../api/physicianRequests';
import { errorMessage, isAbort } from '../api/client';
import type { PhysicianRequestListItem, StatusFilter } from '../data/types';

interface ListState {
  items: PhysicianRequestListItem[];
  totalCount: number;
  exportableCount: number;
}

const EMPTY: ListState = { items: [], totalCount: 0, exportableCount: 0 };

const SEARCH_DEBOUNCE_MS = 300;

function useDebounced(value: string, ms: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

export function useRequests(search: string, status: StatusFilter, branch: string) {
  const [data, setData] = useState<ListState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounced(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    listRequests({ search: debouncedSearch, status, branch }, controller.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbort(err)) return;
        setError(errorMessage(err));
        setData(EMPTY);
        setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, status, branch, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...data, loading, error, refetch };
}
