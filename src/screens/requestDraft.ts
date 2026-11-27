import { useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NO_SPECIALTY, saveRequestSchema } from '../api/schemas';
import type { RequestDraft } from '../data/types';

export type DraftKey = FieldPath<RequestDraft>;

export const EMPTY_DRAFT: RequestDraft = {
  patientName: '', mrn: '', patientStatus: '', requesterName: '', requesterEmail: '', requestedSource: '',
  first: '', middleInitial: '', last: '', npi: '', degree: '', physicianType: '',
  vaTricare: false, pecosVerified: false,
  licenseNumber: '', licenseState: '', licenseExp: '', specialty: NO_SPECIALTY, taxonomy: '', physicianGroup: '',
  vitalAlerts: '', orderNotif: '',
  branch: '', address: '', city: '', state: '', zip: '', phone: '', fax: '',
  officeVital: '', officeOrder: '', officePhysicianGroup: '', admissionCoordinator: '', additionalDetails: '',
};

/**
 * Máscara NNN-NNN-NNNN. No corta en 10 dígitos a propósito: si pegan
 * 1-502-555-0101 los dígitos de más quedan a la vista y el schema marca
 * "must be 10 digits", en vez de guardar en silencio un número corrido.
 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/[^0-9]/g, '').slice(0, 15);
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6);
  if (d.length > 6) return a + '-' + b + '-' + c;
  if (d.length > 3) return a + '-' + b;
  return a;
}

export function onlyAlphanumeric(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, '');
}

/** Middle initial: una sola letra A–Z en mayúscula (columna MI del import de HCHB). */
export function toInitial(raw: string): string {
  return raw.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase();
}

/**
 * raw: true devuelve el estado del form, no la salida del schema — los
 * .transform(emptyToNull) se aplican en toSaveBody, ya en la capa de API.
 * Los errores del 400 del backend se pintan en su campo igual que los del cliente.
 */
export function useRequestForm(defaultValues: RequestDraft, fieldErrors: Record<string, string[]>) {
  const form = useForm<RequestDraft>({
    defaultValues,
    resolver: zodResolver(saveRequestSchema, undefined, { raw: true }),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { setError } = form;

  useEffect(() => {
    Object.entries(fieldErrors).forEach(([key, messages]) => {
      if (messages[0]) setError(key as DraftKey, { type: 'server', message: messages[0] });
    });
  }, [fieldErrors, setError]);

  return form;
}
