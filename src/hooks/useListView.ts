import { useMemo } from 'react';
import { parseApiDate } from '../api/dates';
import { useLabelFor } from './useLookups';
import type { CatalogName } from '../store/catalogs';
import type { PhysicianRequestListItem } from '../data/types';

export type SortKey =
  | 'physician' | 'npi' | 'branch' | 'degree' | 'physicianType' | 'vaTricare'
  | 'patientName' | 'mrn' | 'patientStatus' | 'requesterName' | 'status' | 'created';

export type SortDir = 'asc' | 'desc';

export interface Sort {
  key: SortKey;
  dir: SortDir;
}

export const ALL = 'all';

/** Las columnas que muestran un label del catálogo se ordenan por el label, no por el código. */
const CATALOG_OF: Partial<Record<SortKey, CatalogName>> = {
  degree: 'degrees',
  physicianType: 'physicianTypes',
  patientStatus: 'patientStatuses',
  status: 'requestStatuses',
};

type LabelFor = (name: CatalogName, code: string) => string;

function sortValue(item: PhysicianRequestListItem, key: SortKey, labelFor: LabelFor): string | number {
  if (key === 'physician') return `${item.first} ${item.last}`.toLowerCase();
  if (key === 'created') return parseApiDate(item.created)?.getTime() ?? 0;
  if (key === 'vaTricare') return item.vaTricare ? 1 : 0;
  const catalog = CATALOG_OF[key];
  if (catalog) return labelFor(catalog, item[key]).toLowerCase();
  return item[key].toLowerCase();
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

/** Otra columna arranca ascendente; Created descendente, que es el orden con el que llega. */
export function nextSort(current: Sort, key: SortKey): Sort {
  if (current.key === key) return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
  return { key, dir: key === 'created' ? 'desc' : 'asc' };
}

/**
 * El filtro de Requester y el orden viven en el cliente y no en el backend: la
 * lista no está paginada — el proc devuelve todas las filas que matchean los
 * filtros del servidor — así que acá ya está el set completo sobre el que se
 * puede filtrar y ordenar sin volver a pedir nada.
 */
export function useVisibleRequests(
  items: PhysicianRequestListItem[],
  requester: string,
  sort: Sort,
): PhysicianRequestListItem[] {
  const labelFor = useLabelFor();
  return useMemo(() => {
    const rows = requester === ALL
      ? items
      : items.filter((item) => item.requesterName === requester);

    return [...rows].sort((a, b) => {
      const result =
        compare(sortValue(a, sort.key, labelFor), sortValue(b, sort.key, labelFor)) || a.id - b.id;
      return sort.dir === 'asc' ? result : -result;
    });
  }, [items, requester, sort, labelFor]);
}

/**
 * Las opciones salen de las filas que devolvió el backend, así que siguen a los
 * filtros del servidor. El valor elegido se antepone si ya no aparece entre
 * ellas: sin eso el <select> mostraría "All" con el filtro todavía aplicado.
 */
export function useRequesterOptions(items: PhysicianRequestListItem[], selected: string) {
  return useMemo(() => {
    const names = [...new Set(items.map((item) => item.requesterName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    if (selected !== ALL && !names.includes(selected)) names.unshift(selected);
    return [{ value: ALL, label: 'All' }, ...names.map((name) => ({ value: name, label: name }))];
  }, [items, selected]);
}
