import { useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveRequestSchema } from '../api/schemas';
import type { RequestDraft } from '../data/types';

export type DraftKey = FieldPath<RequestDraft>;

export const EMPTY_DRAFT: RequestDraft = {
  patientName: '', mrn: '', patientStatus: '', requesterName: '', requesterEmail: '', requestedSource: '',
  first: '', last: '', npi: '', degree: '', physicianType: '',
  vaTricare: false, pecosVerified: false,
  licenseNumber: '', licenseState: '', licenseExp: '', specialty: '', taxonomy: '', physicianGroup: '',
  vitalAlerts: '', orderNotif: '',
  branch: '', address: '', city: '', state: '', zip: '', phone: '', fax: '',
  officeVital: '', officeOrder: '', officePhysicianGroup: '', admissionCoordinator: '', additionalDetails: '',
};

export function formatPhone(raw: string): string {
  const d = raw.replace(/[^0-9]/g, '').slice(0, 10);
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 10);
  if (d.length > 6) return a + '-' + b + '-' + c;
  if (d.length > 3) return a + '-' + b;
  return a;
}

export function onlyAlphanumeric(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, '');
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
