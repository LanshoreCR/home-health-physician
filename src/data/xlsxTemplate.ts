import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import type { PhysicianRequest } from './types';

const SHEET = 'xl/worksheets/sheet1.xml';
const SHEET_RELS = 'xl/worksheets/_rels/sheet1.xml.rels';
const CONTENT_TYPES = '[Content_Types].xml';
const COMMENTS = 'xl/comments1.xml';
const VML = 'xl/drawings/vmlDrawing1.vml';

const DATA_STYLE = ' s="15"';
const FIRST_DATA_ROW = 3;

type Column = { col: string; get: (r: PhysicianRequest) => string; num?: boolean };

const upper = (v: string) => v.toUpperCase();

/** Columns filled on export, kept in ascending spreadsheet order (cells must be ordered). */
const COLUMNS: Column[] = [
  { col: 'A', get: (r) => r.last },
  { col: 'B', get: (r) => r.first },
  { col: 'D', get: (r) => upper(r.vitalAlerts) },
  { col: 'G', get: (r) => upper(r.orderNotif) },
  { col: 'I', get: (r) => upper(r.degree) },
  { col: 'O', get: () => '*NONE SELECTED' },
  { col: 'P', get: () => '*NONE' },
  { col: 'T', get: (r) => r.npi, num: true },
  { col: 'V', get: (r) => r.address },
  { col: 'W', get: (r) => r.city },
  { col: 'X', get: (r) => upper(r.state) },
  { col: 'Y', get: (r) => r.zip, num: true },
  { col: 'Z', get: (r) => r.phone },
  { col: 'AA', get: (r) => r.fax },
  { col: 'AB', get: (r) => upper(r.officeVital) },
  { col: 'AC', get: (r) => upper(r.officeOrder) },
  { col: 'AD', get: () => '*NONE' },
  { col: 'AE', get: () => 'NONE ASSIGNED' },
  { col: 'AF', get: () => 'NONE ASSIGNED' },
  { col: 'AG', get: () => 'NONE ASSIGNED' },
  { col: 'AH', get: () => 'NONE ASSIGNED' },
  { col: 'AI', get: () => 'N' },
  { col: 'AJ', get: (r) => r.branch },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** True only for plain positive integers that survive as an XLSX number without precision/format loss. */
function isSafeNumber(v: string): boolean {
  return /^[1-9]\d{0,14}$/.test(v);
}

function cellXml(ref: string, raw: string, num?: boolean): string {
  if (raw === '') return '';
  if (num && isSafeNumber(raw)) return `<c r="${ref}"${DATA_STYLE}><v>${raw}</v></c>`;
  return `<c r="${ref}"${DATA_STYLE} t="inlineStr"><is><t xml:space="preserve">${escapeXml(raw)}</t></is></c>`;
}

function rowXml(r: PhysicianRequest, rowNum: number): string {
  const cells = COLUMNS.map((c) => cellXml(`${c.col}${rowNum}`, c.get(r), c.num)).join('');
  return `<row r="${rowNum}" spans="1:38">${cells}</row>`;
}

function rewriteSheet(xml: string, requests: PhysicianRequest[]): string {
  const withoutData = xml.replace(
    /<row r="(\d+)"[^>]*>.*?<\/row>/gs,
    (m, n) => (Number(n) >= FIRST_DATA_ROW ? '' : m),
  );
  const rows = requests.map((r, i) => rowXml(r, FIRST_DATA_ROW + i)).join('');
  const withRows = withoutData.replace('</sheetData>', `${rows}</sheetData>`);
  const lastRow = requests.length ? FIRST_DATA_ROW - 1 + requests.length : 2;
  return withRows
    .replace(/<dimension ref="[^"]*"\/>/, `<dimension ref="A1:AL${lastRow}"/>`)
    .replace(/<legacyDrawing r:id="rId2"\/>/, '');
}

/** Remove the example-comment parts so the "Example…" note can't land on real data. */
function stripExampleComment(files: Record<string, Uint8Array>): void {
  delete files[COMMENTS];
  delete files[VML];
  files[SHEET_RELS] = strToU8(
    strFromU8(files[SHEET_RELS]).replace(
      /<Relationship Id="rId[23]"[^>]*\/>/g,
      (m) => (m.includes('printerSettings') ? m : ''),
    ),
  );
  files[CONTENT_TYPES] = strToU8(
    strFromU8(files[CONTENT_TYPES]).replace(
      /<Override PartName="\/xl\/comments1\.xml"[^>]*\/>/,
      '',
    ),
  );
}

/** Fill the HCHB import template with the given requests; returns the .xlsx bytes. */
export function fillTemplate(template: Uint8Array, requests: PhysicianRequest[]): Uint8Array {
  const files = unzipSync(template);
  files[SHEET] = strToU8(rewriteSheet(strFromU8(files[SHEET]), requests));
  stripExampleComment(files);
  return zipSync(files);
}
