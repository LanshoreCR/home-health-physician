import { useCatalogsStore } from '../store/catalogs';

export function useBranches(): string[] {
  return useCatalogsStore((state) => state.branches);
}
