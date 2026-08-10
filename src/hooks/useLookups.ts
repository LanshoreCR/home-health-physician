import { useCallback, useMemo } from 'react';
import { toOptions } from '../api/schemas';
import { catalogFrom, labelFrom, useCatalogsStore, type CatalogName } from '../store/catalogs';
import { EXPORTABLE_STATUSES } from '../data/types';
import type { RequestStatus } from '../data/types';

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

/** El useMemo va fuera del selector: zustand v5 compara la referencia del snapshot. */
export function useCatalogOptions(name: CatalogName) {
  const lookups = useCatalogsStore((state) => state.lookups);
  return useMemo(() => toOptions(catalogFrom(lookups, name)), [lookups, name]);
}

/**
 * Antepone el status actual si el catálogo no lo trae: un <select> sin option
 * que matchee muestra la primera en silencio, y el siguiente click parecería un
 * no-op que en realidad cambia el status.
 */
export function useStatusOptions(current?: RequestStatus) {
  const options = useCatalogOptions('requestStatuses');
  return useMemo(() => {
    if (!current) return options;
    if (options.some((option) => option.value === current)) return options;
    return [{ value: current, label: current }, ...options];
  }, [options, current]);
}

export function useStatusFilterOptions() {
  const options = useStatusOptions();
  return useMemo(() => [{ value: 'all', label: 'All' }, ...options], [options]);
}

/** "A, B, and C" — coma de Oxford, como estaba escrito el copy a mano. */
function joinList(items: string[], conjunction: string): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

/**
 * El detalle y el diálogo de export nombran los mismos estatus con distinta
 * conjunción, así que se devuelve el armador y no la frase ya resuelta.
 */
export function useExportableLabels() {
  const labelFor = useLabelFor();
  return useCallback(
    (conjunction: string) =>
      joinList(EXPORTABLE_STATUSES.map((status) => labelFor('requestStatuses', status)), conjunction),
    [labelFor],
  );
}
