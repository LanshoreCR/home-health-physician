const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * El backend serializa DateTime con "O" desde columnas DATETIME2 con Kind
 * Unspecified: los valores son UTC pero la cadena no trae Z ni offset, así que
 * new Date() los interpretaría como hora local y correría el timestamp.
 */
export function parseApiDate(raw: string): Date | null {
  if (!raw) return null;
  const hasZone = /[Zz]$|[+-]\d{2}:\d{2}$/.test(raw);
  const date = new Date(hasZone ? raw : `${raw}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCreated(raw: string): string {
  const date = parseApiDate(raw);
  if (!date) return raw;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * El servidor nombra el archivo con DateTime.UtcNow y no expone Content-Disposition.
 * La hora va en el nombre porque el export es repetible: dos batches del mismo día
 * tienen que distinguirse en la carpeta de descargas.
 */
export function exportFilename(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  return `PAT_Export_${date}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}.xlsx`;
}

/**
 * El <input type="date"> habla en fecha local: con getUTCDate() la tarde de
 * Costa Rica ya arrancaría el rango en el día siguiente.
 */
export function todayInput(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
