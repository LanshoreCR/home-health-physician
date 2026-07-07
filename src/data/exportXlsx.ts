import templateUrl from '../assets/PHYSICIAN_IMPORT_TEMPLATE.xlsx?url';
import { fillTemplate } from './xlsxTemplate';
import type { PhysicianRequest } from './types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

let templateBytes: Uint8Array | null = null;
async function loadTemplate(): Promise<Uint8Array> {
  if (!templateBytes) {
    const res = await fetch(templateUrl);
    templateBytes = new Uint8Array(await res.arrayBuffer());
  }
  return templateBytes;
}

export async function buildPhysicianXlsx(requests: PhysicianRequest[]): Promise<Blob> {
  const out = fillTemplate(await loadTemplate(), requests);
  const buffer = new ArrayBuffer(out.byteLength);
  new Uint8Array(buffer).set(out);
  return new Blob([buffer], { type: XLSX_MIME });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
