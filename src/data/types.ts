export type RequestStatus = 'new' | 'modify' | 'manual' | 'notfound' | 'special';

/** Clean states whose requests are ready to export to HCHB. */
export const EXPORTABLE_STATUSES: RequestStatus[] = ['new', 'modify'];

export interface PhysicianRequest {
  id: number;
  first: string;
  last: string;
  npi: string;
  branch: string;
  degree: string;
  status: RequestStatus;
  created: string;
  submitter: string;
  vitalAlerts: string;
  orderNotif: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
  officeVital: string;
  officeOrder: string;
}

export type RequestDraft = Omit<PhysicianRequest, 'id' | 'status' | 'created' | 'submitter'>;

export type StatusFilter = 'all' | RequestStatus;
