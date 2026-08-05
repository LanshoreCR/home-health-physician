import { useCallback } from 'react';
import { labelFrom, useCatalogsStore, type CatalogName } from '../store/catalogs';

/**
 * Tres selectores atómicos y no uno que arme un objeto: zustand v5 compara
 * snapshots por identidad, así que un selector que construye algo nuevo en cada
 * llamada dispara el warning de getSnapshot.
 */
export function useLookups() {
  const lookups = useCatalogsStore((state) => state.lookups);
  const error = useCatalogsStore((state) => state.error);
  const retry = useCatalogsStore((state) => state.refreshLookups);
  return { lookups, error, retry };
}

/**
 * Devuelve el traductor, no un label: las pantallas de detalle y lista tienen
 * diez y tres campos por resolver, y así es una suscripción por componente.
 */
export function useLabelFor() {
  const lookups = useCatalogsStore((state) => state.lookups);
  return useCallback(
    (name: CatalogName, code: string) => labelFrom(lookups, name, code),
    [lookups],
  );
}
