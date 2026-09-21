import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { errorMessage } from '../api/client';
import { getLookups } from '../api/lookups';
import { listBranches } from '../api/physicianRequests';
import { lookupsSchema } from '../api/schemas';
import type { LookupItem, Lookups } from '../api/schemas';

export type CatalogName = keyof Lookups;

const cacheSchema = z.object({
  lookups: lookupsSchema.nullable(),
});

type Cache = z.infer<typeof cacheSchema>;

const EMPTY_CACHE: Cache = { lookups: null };

/** Lo persistido se re-valida antes de aplicarse: un payload viejo no llega a renderizar. */
function validCache(persisted: unknown): Cache {
  const parsed = cacheSchema.safeParse(persisted);
  if (!parsed.success) return EMPTY_CACHE;
  return parsed.data;
}

interface CatalogsState extends Cache {
  error: string | null;
  /** No es un catálogo: sale de las requests vivas, así que no se persiste. */
  branches: string[];
  /** Los pide siempre: el bootstrap, el Retry del form y cualquier invalidación. */
  refreshLookups: () => Promise<void>;
  refreshBranches: () => Promise<void>;
}

let lookupsInFlight: Promise<void> | null = null;
let branchesInFlight: Promise<void> | null = null;

/**
 * Catálogos del backend. Lo persistido en localStorage es solo para pintar al
 * instante: cada arranque revalida contra el API, así que una fila nueva en un
 * lookup (un status recién seeded, pongamos) aparece con un refresh y no hay
 * que esperar a que venza nada ni limpiar el storage a mano.
 *
 * Solo códigos y labels: nada derivado de un PhysicianRequest (paciente, MRN,
 * email del requester) puede entrar acá — es storage sin cifrar.
 */
export const useCatalogsStore = create<CatalogsState>()(
  persist(
    (set) => ({
      ...EMPTY_CACHE,
      error: null,
      branches: [],

      refreshLookups: () => {
        if (lookupsInFlight) return lookupsInFlight;
        set({ error: null });

        const request: Promise<void> = getLookups()
          .then((data) => {
            /**
             * parseResponse no tira: ante un cambio de contrato avisa y devuelve
             * el body crudo. Revalidar acá evita guardar catálogos a medias, y
             * fallar sin borrar deja la caché buena en pie.
             */
            const parsed = lookupsSchema.safeParse(data);
            if (!parsed.success) throw new Error('The server returned catalogs in an unexpected format.');
            set({ lookups: parsed.data });
          })
          .catch((err: unknown) => {
            set({ error: errorMessage(err) });
          })
          .finally(() => {
            lookupsInFlight = null;
          });

        lookupsInFlight = request;
        return request;
      },

      /** Degrada a "All" si falla: el filtro de branch no vale bloquear la lista. */
      refreshBranches: () => {
        if (branchesInFlight) return branchesInFlight;

        const request: Promise<void> = listBranches()
          .then((branches) => {
            set({ branches });
          })
          .catch((err: unknown) => {
            console.warn('[api] listBranches failed', err);
          })
          .finally(() => {
            branchesInFlight = null;
          });

        branchesInFlight = request;
        return request;
      },
    }),
    {
      name: 'hhp-catalogs',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Cache => ({ lookups: state.lookups }),
      migrate: () => EMPTY_CACHE,
      merge: (persisted, current) => ({ ...current, ...validCache(persisted) }),
    },
  ),
);

/** Se llama una vez en el bootstrap: a nivel de módulo StrictMode no lo duplica. */
export function loadCatalogs() {
  const { refreshLookups, refreshBranches } = useCatalogsStore.getState();
  void refreshLookups();
  void refreshBranches();
}

export function catalogFrom(lookups: Lookups | null, name: CatalogName): LookupItem[] {
  const items = lookups?.[name];
  if (!Array.isArray(items)) return [];
  return items;
}

/** Cae al código crudo: sin catálogo todavía, o código desconocido, se ve como hoy. */
export function labelFrom(lookups: Lookups | null, name: CatalogName, code: string): string {
  const match = catalogFrom(lookups, name).find((item) => item.code === code);
  return match?.label ?? code;
}
