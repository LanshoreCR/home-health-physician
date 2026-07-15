import { Button } from '../ui/Button';
import type { PhysicianRequest } from '../data/types';

const DownloadIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);

interface ExportDialogProps {
  requests: PhysicianRequest[];
  filename?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * ExportDialog — confirms exporting the clean (New Request / Modify Physician / Request Approved) requests to
 * an HCHB-formatted Excel file. Held requests are excluded from the batch.
 */
export function ExportDialog({ requests, filename = 'PAT_Export.xlsx', onCancel, onConfirm }: ExportDialogProps) {
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
            {requests.length} clean <span style={{ fontWeight: 600, color: 'var(--status-newreq-fg)' }}>New Request / Modify Physician / Request Approved</span> requests will be exported to an HCHB-formatted Excel file. Held requests are excluded.
          </p>
        </div>

        <div style={{ margin: '0 26px', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {requests.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i === requests.length - 1 ? 'none' : '1px solid var(--border-divider)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)' }}>
              <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>{r.first} {r.last} <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>· {r.degree}</span></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-muted)' }}>{r.npi}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 26px 0', padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: 'var(--radius-xs)', background: 'var(--success-50)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--success-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-heading)' }}>{filename}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' }}>HCHB upload format · {requests.length} rows</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px 26px 24px' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="success" icon={DownloadIcon} onClick={onConfirm}>Export {requests.length} requests</Button>
        </div>
      </div>
    </div>
  );
}
