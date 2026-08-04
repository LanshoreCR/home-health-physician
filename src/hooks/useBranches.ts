import { useEffect, useState } from 'react';
import { listBranches } from '../api/physicianRequests';
import { isAbort } from '../api/client';

/** El dropdown de branch degrada a "All" si falla; no vale bloquear la lista. */
export function useBranches(reloadKey: number): string[] {
  const [branches, setBranches] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    listBranches(controller.signal)
      .then(setBranches)
      .catch((err) => {
        if (isAbort(err)) return;
        console.warn('[api] listBranches failed', err);
      });
    return () => controller.abort();
  }, [reloadKey]);

  return branches;
}
