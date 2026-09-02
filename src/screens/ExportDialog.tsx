import { useState } from 'react';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { exportFilename, todayInput } from '../api/dates';
import { statusColors } from '../data/labels';
import { EXPORTABLE_STATUSES } from '../data/types';
import { useExportableLabels } from '../hooks/useLookups';
import type { ExportRange } from '../api/export';

const DownloadIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);

interface ExportDialogProps {
  exporting: boolean;
  onCancel: () => void;
  onConfirm: (range: ExportRange) => void;
}

/**
 * ExportDialog — confirms exporting the clean requests to an HCHB-formatted
 * Excel file. Held requests are excluded from the batch.
 * El servidor arma el archivo y decide el batch: acá solo se elige el rango.
 * No se muestra un conteo porque la fila de lista no trae exportedAt y el
 * conteo del servidor describe la cola entera, no el rango.
 */
export function ExportDialog({ exporting, onCancel, onConfirm }: ExportDialogProps) {
  const [from, setFrom] = useState(todayInput);
  const [to, setTo] = useState(todayInput);
  const filename = exportFilename();
  const exportableLabels = useExportableLabels();
  const highlight = statusColors(EXPORTABLE_STATUSES[0]).fg;
  const missing = from === '' || to === '';
  const backwards = !missing && from > to;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ width: '520px', background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-dialog)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 26px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: 'var(--radius-lg)', background: 'var(--success-50)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-dialog-title)', color: 'var(--text-heading)' }}>Export ready requests</h2>
          </div>
          <p style={{ margin: '0 0 20px 50px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', color: 'var(--text-muted)' }}>
            Every clean <span style={{ fontWeight: 600, color: highlight }}>{exportableLabels('and')}</span> request that has never been exported goes into the file, plus the ones already exported within the dates below. Held requests are excluded.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', margin: '0 26px 16px' }}>
          <Field label="Exported from" htmlFor="export-from" style={{ flex: 1 }}>
            <Input id="export-from" type="date" value={from} invalid={backwards} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field
            label="Exported to"
            htmlFor="export-to"
            hint={backwards ? 'The end date cannot be earlier than the start date.' : undefined}
            style={{ flex: 1 }}
          >
            <Input id="export-to" type="date" value={to} invalid={backwards} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 26px', padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: 'var(--radius-xs)', background: 'var(--success-50)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--success-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-heading)' }}>{filename}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' }}>HCHB upload format</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px 26px 24px' }}>
          <Button variant="ghost" onClick={onCancel} disabled={exporting}>Cancel</Button>
          <Button variant="success" icon={DownloadIcon} onClick={() => onConfirm({ from, to })} disabled={exporting || missing || backwards}>
            {exporting ? 'Exporting…' : 'Export batch'}
          </Button>
        </div>
      </div>
    </div>
  );
}
