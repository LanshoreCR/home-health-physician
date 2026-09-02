import { z } from 'zod';
import { formatCreated } from './dates';

/**
 * Fuente única de verdad del contrato con home-health-physician-api.
 * El swagger.json generado no documenta 400/404/500 ni el schema de /api/export,
 * así que no sirve para codegen: esto se escribe contra los DTOs reales.
 *
 * Asimetría deliberada: las escrituras se parsean en estricto (queremos fallar
 * antes de mandar), las lecturas con safeParse y fallback (un cambio cosmético
 * del backend no debe tumbar una pantalla).
 */

export const requestStatusSchema = z.enum([
  'newreq',
  'duplicate',
  'modify',
  'manual',
  'special',
  'denied',
  'approved',
  'imported',
]);

// ---------------------------------------------------------------- lecturas

const apiDate = z.string().transform(formatCreated);

export const physicianRequestListItemSchema = z.object({
  id: z.number(),
  first: z.string(),
  last: z.string(),
  npi: z.string(),
  branch: z.string(),
  degree: z.string(),
  physicianType: z.string(),
  vaTricare: z.boolean(),
  patientName: z.string(),
  mrn: z.string(),
  patientStatus: z.string(),
  requesterName: z.string(),
  status: requestStatusSchema,
  created: apiDate,
});

export const physicianRequestListSchema = z.object({
  items: z.array(physicianRequestListItemSchema),
  totalCount: z.number(),
  exportableCount: z.number(),
});

export const physicianRequestSchema = z.object({
  id: z.number(),
  patientName: z.string(),
  mrn: z.string(),
  patientStatus: z.string(),
  requesterName: z.string(),
  requesterEmail: z.string(),
  first: z.string(),
  last: z.string(),
  npi: z.string(),
  degree: z.string(),
  physicianType: z.string(),
  vaTricare: z.boolean(),
  pecosVerified: z.boolean(),
  licenseNumber: z.string(),
  licenseState: z.string(),
  licenseExp: z.string(),
  specialty: z.string(),
  taxonomy: z.string(),
  physicianGroup: z.string(),
  vitalAlerts: z.string(),
  orderNotif: z.string(),
  branch: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  phone: z.string(),
  fax: z.string(),
  officeVital: z.string(),
  officeOrder: z.string(),
  officePhysicianGroup: z.string(),
  admissionCoordinator: z.string(),
  additionalDetails: z.string(),
  status: requestStatusSchema,
  created: apiDate,
  submitter: z.string(),
  exportedAt: z.string().nullable(),
});

export const lookupItemSchema = z.object({ code: z.string(), label: z.string() });

export const lookupsSchema = z.object({
  patientStatuses: z.array(lookupItemSchema),
  degrees: z.array(lookupItemSchema),
  physicianTypes: z.array(lookupItemSchema),
  vitalAlertMethods: z.array(lookupItemSchema),
  orderNotifMethods: z.array(lookupItemSchema),
  states: z.array(lookupItemSchema),
  requestStatuses: z.array(lookupItemSchema),
});

export const currentUserSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
});

export const branchesSchema = z.array(z.string());
export const createdSchema = z.object({ id: z.number() });
export const setStatusResultSchema = z.object({ success: z.boolean(), emailSent: z.boolean() });

// -------------------------------------------------------------- escrituras

const emptyToNull = (value: string) => (value === '' ? null : value);

const required = (max: number, message = 'Required') =>
  z.string().trim().min(1, message).max(max, `Max ${max} characters`);

const optional = (max: number) =>
  z.string().trim().max(max, `Max ${max} characters`).transform(emptyToNull);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Tope propio del cliente para texto libre: más estricto que el DataAnnotation del backend. */
const TEXT_MAX = 50;

/**
 * String y no z.enum a propósito: el resto del contrato tipa physicianType como
 * string y el form arranca en '', así que la entrada del schema tiene que ser
 * el mismo string que el estado del form.
 */
const PHYSICIAN_TYPES = ['f2f', 'primarySecondary'];

/**
 * Espejo de los DataAnnotations de SavePhysicianRequestRequest. La entrada es
 * el estado del form (todo string, '' cuando está vacío); la salida es el body
 * del wire, donde los opcionales vacíos van como null — mandar '' en licenseExp
 * devuelve 400 porque en el backend es DateTime?.
 */
export const saveRequestSchema = z.object({
  patientName: required(TEXT_MAX),
  mrn: required(50).regex(/^[A-Za-z0-9]+$/, 'MRN must contain letters and digits only'),
  patientStatus: required(20),
  requesterName: required(TEXT_MAX),
  requesterEmail: required(256).pipe(z.email('Enter a valid email address')),
  first: required(TEXT_MAX),
  last: required(TEXT_MAX),
  npi: z.string().trim().regex(/^\d{10}$/, 'NPI must be 10 digits'),
  degree: required(20),
  physicianType: z
    .string()
    .refine((v) => PHYSICIAN_TYPES.includes(v), 'Select F2F Only or Primary/Secondary'),
  vaTricare: z.boolean(),
  pecosVerified: z.boolean(),
  licenseNumber: optional(50),
  licenseState: optional(20),
  licenseExp: z
    .string()
    .trim()
    .refine((v) => v === '' || ISO_DATE.test(v), 'Use the YYYY-MM-DD format')
    .transform(emptyToNull),
  specialty: optional(TEXT_MAX),
  taxonomy: optional(20),
  physicianGroup: optional(TEXT_MAX),
  vitalAlerts: required(20),
  orderNotif: required(20),
  branch: required(25),
  address: required(TEXT_MAX),
  city: required(TEXT_MAX),
  state: required(20),
  zip: required(10),
  phone: required(12),
  fax: required(12),
  officeVital: optional(20),
  officeOrder: optional(20),
  officePhysicianGroup: optional(TEXT_MAX),
  admissionCoordinator: optional(TEXT_MAX),
  additionalDetails: z.string().trim().transform(emptyToNull),
});

export type SaveRequestBody = z.infer<typeof saveRequestSchema>;

export type PhysicianRequest = z.infer<typeof physicianRequestSchema>;
export type PhysicianRequestListItem = z.infer<typeof physicianRequestListItemSchema>;
export type PhysicianRequestList = z.infer<typeof physicianRequestListSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type LookupItem = z.infer<typeof lookupItemSchema>;
export type Lookups = z.infer<typeof lookupsSchema>;
export type SetStatusResult = z.infer<typeof setStatusResultSchema>;

/** Estado del form: todo string, sin los campos que asigna el servidor. */
export type RequestDraft = Omit<
  PhysicianRequest,
  'id' | 'status' | 'created' | 'submitter' | 'exportedAt'
>;

// ----------------------------------------------------------------- helpers

/**
 * Valida una respuesta sin tumbar la pantalla: si el contrato cambió, avisa en
 * consola y devuelve el dato crudo (las transformaciones no se aplican).
 */
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  console.warn(`[api] ${label}: la respuesta no coincide con el schema`, z.treeifyError(result.error));
  return data as T;
}

export interface DraftValidation {
  ok: boolean;
  fieldErrors: Record<string, string[]>;
}

export function validateDraft(draft: RequestDraft): DraftValidation {
  const result = saveRequestSchema.safeParse(draft);
  if (result.success) return { ok: true, fieldErrors: {} };
  const flat = z.flattenError(result.error).fieldErrors as Record<string, string[]>;
  return { ok: false, fieldErrors: flat };
}

/** El submitter ya no viaja en el body: el backend lo saca del token. */
export function toSaveBody(draft: RequestDraft): SaveRequestBody {
  return saveRequestSchema.parse(draft);
}

export function toDraft(request: PhysicianRequest): RequestDraft {
  const { id: _id, status: _s, created: _c, submitter: _sub, exportedAt: _e, ...draft } = request;
  return draft;
}

export function toOptions(items: LookupItem[]): { value: string; label: string }[] {
  return items.map((item) => ({ value: item.code, label: item.label }));
}
