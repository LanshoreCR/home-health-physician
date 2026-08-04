import { Button } from '../ui/Button';

const WarnIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmación para acciones destructivas, con el mismo lenguaje visual que ExportDialog. */
export function ConfirmDialog({ title, message, confirmLabel, busy, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ width: '460px', background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-dialog)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 26px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: 'var(--radius-lg)', background: 'var(--danger-50)' }}>
              {WarnIcon}
            </span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-dialog-title)', color: 'var(--text-heading)' }}>{title}</h2>
          </div>
          <p style={{ margin: '0 0 4px 50px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px 26px 24px' }}>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
