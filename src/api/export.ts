import { api } from './client';
import { exportFilename } from './dates';

/** Devuelve false cuando el backend responde 204: no había nada por exportar. */
export async function exportBatch(): Promise<boolean> {
  const blob = await api.blob('/export');
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
