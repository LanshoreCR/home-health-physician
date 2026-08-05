import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { errorMessage } from '../api/client';
import { getLookups } from '../api/lookups';
import { lookupsSchema } from '../api/schemas';
import type { LookupItem, Lookups } from '../api/schemas';

export type CatalogName = keyof Lookups;

const TTL_MS = 24 * 60 * 60 * 1000;

const cacheSchema = z.object({
  lookups: lookupsSchema.nullable(),
  fetchedAt: z.number().nullable(),
});

type Cache = z.infer<typeof cacheSchema>;

const EMPTY_CACHE: Cache = { lookups: null, fetchedAt: null };

/** Lo persistido se re-valida antes de aplicarse: un payload viejo no llega a renderizar. */
function validCache(persisted: unknown): Cache {
  const parsed = cacheSchema.safeParse(persisted);
  if (!parsed.success) return EMPTY_CACHE;
  return parsed.data;
}

interface CatalogsState extends Cache {
  error: string | null;
  /** Pide los catálogos solo si no hay caché fresca. */
  loadLookups: () => Promise<void>;
  /** Los pide siempre — el Retry del form y cualquier invalidación explícita. */
  refreshLookups: () => Promise<void>;
}

let lookupsInFlight: Promise<void> | null = null;

/**
 * Catálogos del backend. Se persisten en localStorage con un TTL para que la
 * recarga pinte al instante y revalide de fondo.
 *
 * Solo códigos y labels: nada derivado de un PhysicianRequest (paciente, MRN,
 * email del requester) puede entrar acá — es storage sin cifrar.
 */
export const useCatalogsStore = create<CatalogsState>()(
  persist(
    (set, get) => ({
      ...EMPTY_CACHE,
      error: null,

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
            set({ lookups: parsed.data, fetchedAt: Date.now() });
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

      loadLookups: () => {
        const { fetchedAt } = get();
        if (fetchedAt && Date.now() - fetchedAt < TTL_MS) return Promise.resolve();
        return get().refreshLookups();
      },

    }),
    {
      name: 'hhp-catalogs',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Cache => ({ lookups: state.lookups, fetchedAt: state.fetchedAt }),
      migrate: () => EMPTY_CACHE,
      merge: (persisted, current) => ({ ...current, ...validCache(persisted) }),
    },
  ),
);

/** Se llama una vez en el bootstrap: a nivel de módulo StrictMode no lo duplica. */
export function loadCatalogs() {
  void useCatalogsStore.getState().loadLookups();
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
