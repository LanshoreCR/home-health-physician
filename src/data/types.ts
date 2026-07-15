export type RequestStatus =
  | 'newreq'
  | 'duplicate'
  | 'modify'
  | 'manual'
  | 'special'
  | 'denied'
  | 'approved';

/** Clean states whose requests are ready to export to HCHB. */
export const EXPORTABLE_STATUSES: RequestStatus[] = ['newreq', 'modify', 'approved'];

/** States that fire a response back to the requester. */
export const TRIGGER_STATUSES: RequestStatus[] = ['denied', 'approved'];

export interface PhysicianRequest {
  id: number;
  patientName: string;
  mrn: string;
  patientStatus: string;
  requesterName: string;
  requesterEmail: string;
  first: string;
  last: string;
  npi: string;
  degree: string;
  physicianType: string;
  vaTricare: boolean;
  pecosVerified: boolean;
  licenseNumber: string;
  licenseState: string;
  licenseExp: string;
  specialty: string;
  taxonomy: string;
  physicianGroup: string;
  vitalAlerts: string;
  orderNotif: string;
  branch: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
  officeVital: string;
  officeOrder: string;
  officePhysicianGroup: string;
  admissionCoordinator: string;
  additionalDetails: string;
  status: RequestStatus;
  created: string;
  submitter: string;
}

export type RequestDraft = Omit<PhysicianRequest, 'id' | 'status' | 'created' | 'submitter'>;

export type StatusFilter = 'all' | RequestStatus;
