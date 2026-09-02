import { api, buildQuery } from './client';
import { exportFilename } from './dates';

/** Fechas en yyyy-MM-dd, tal como las escribe el <input type="date">. */
export interface ExportRange {
  from: string;
  to: string;
}

/** Devuelve false cuando el backend responde 204: no había nada por exportar. */
export async function exportBatch(range: ExportRange): Promise<boolean> {
  const query = buildQuery({ from: range.from, to: range.to });
  const blob = await api.blob(`/export${query}`);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFilename();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
