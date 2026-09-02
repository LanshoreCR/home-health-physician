import { useState, type ReactNode } from 'react';
import { AppBar } from './ui/AppBar';
import { RequestsList } from './screens/RequestsList';
import { DetailSkeleton, RequestDetail } from './screens/RequestDetail';
import { RequestForm } from './screens/RequestForm';
import { ExportDialog } from './screens/ExportDialog';
import { ConfirmDialog } from './screens/ConfirmDialog';
import { useRequests } from './hooks/useRequests';
import { useRequest } from './hooks/useRequest';
import { useBranches } from './hooks/useBranches';
import { useCatalogsStore } from './store/catalogs';
import {
  createRequest,
  deleteRequest,
  setRequestStatus,
  updateRequest,
} from './api/physicianRequests';
import { exportBatch, type ExportRange } from './api/export';
import { ApiError, errorMessage } from './api/client';
import { toDraft } from './api/schemas';
// import { TRIGGER_STATUSES } from './data/types';
import type { PhysicianRequest, RequestDraft, RequestStatus, StatusFilter } from './data/types';
import type { Sort } from './hooks/useListView';
import { useRole } from './auth/useRole';
import { signOut } from './auth/okta';
import { initialsOf, useSessionStore } from './store/session';

type View = 'list' | 'detail' | 'form';

export function App() {
  const user = useSessionStore((state) => state.user);
  const can = useRole();
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<PhysicianRequest | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string[]>>({});
  const [statusPending, setStatusPending] = useState(false);
  // Email deshabilitado hasta que existan las credenciales de Microsoft Graph.
  // const [emailFailed, setEmailFailed] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [branchFilter, setBranchFilter] = useState('all');
  /** Requester y orden se resuelven en el cliente: no viajan a useRequests. */
  const [requesterFilter, setRequesterFilter] = useState('all');
  const [sort, setSort] = useState<Sort>({ key: 'created', dir: 'desc' });

  const list = useRequests(search, statusFilter, branchFilter);
  const branches = useBranches();
  const detail = useRequest(view === 'detail' ? selectedId : null);

  /** Toda mutación invalida la lista y el catálogo de branches. */
  const invalidate = () => {
    list.refetch();
    void useCatalogsStore.getState().refreshBranches();
  };

  const clearFormErrors = () => {
    setFormError(null);
    setFormFieldErrors({});
  };

  const openDetail = (id: number) => {
    setSelectedId(id);
    // setEmailFailed(false);
    setView('detail');
  };

  const goList = () => {
    clearFormErrors();
    setView('list');
  };

  const startCreate = () => {
    setEditing(null);
    clearFormErrors();
    setView('form');
  };

  const startEdit = () => {
    setEditing(detail.request);
    clearFormErrors();
    setView('form');
  };

  const changeStatus = async (status: RequestStatus) => {
    if (selectedId === null) return;
    setStatusPending(true);
    // setEmailFailed(false);
    try {
      await setRequestStatus(selectedId, status);
      // const result = await setRequestStatus(selectedId, status);
      // setEmailFailed(TRIGGER_STATUSES.includes(status) && !result.emailSent);
      detail.refetch();
      invalidate();
    } catch (err) {
      window.alert(errorMessage(err));
    } finally {
      setStatusPending(false);
    }
  };

  const confirmDelete = async () => {
    if (selectedId === null) return;
    setDeleting(true);
    try {
      await deleteRequest(selectedId);
      setConfirmingDelete(false);
      setSelectedId(null);
      setView('list');
      invalidate();
    } catch (err) {
      window.alert(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const submitForm = async (values: RequestDraft) => {
    setSubmitting(true);
    clearFormErrors();
    try {
      if (editing) await updateRequest(editing.id, values);
      if (!editing) await createRequest(values);
      setEditing(null);
      setView('list');
      invalidate();
    } catch (err) {
      setFormError(errorMessage(err));
      if (err instanceof ApiError && err.fieldErrors) setFormFieldErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmExport = async (range: ExportRange) => {
    setExporting(true);
    try {
      const downloaded = await exportBatch(range);
      if (!downloaded) window.alert('There is nothing to export — no approved request is waiting, and none was exported in that range.');
      invalidate();
    } catch (err) {
      window.alert(errorMessage(err));
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  };

  let crumb: ReactNode = null;
  if (view === 'detail' && detail.request) {
    crumb = (
      <><span className="lnk" onClick={goList}>Requests</span><span>/</span><span className="cur">{detail.request.first} {detail.request.last}</span></>
    );
  }
  if (view === 'form') {
    crumb = (
      <><span className="lnk" onClick={goList}>Requests</span><span>/</span><span className="cur">{editing ? `${editing.first} ${editing.last}` : 'New request'}</span></>
    );
  }

  return (
    <>
      <AppBar
        crumb={crumb}
        name={user?.name ?? ''}
        initials={initialsOf(user?.name ?? '')}
        onSignOut={() => void signOut()}
      />

      {view === 'list' && (
        <RequestsList
          requests={list.items}
          totalCount={list.totalCount}
          exportableCount={list.exportableCount}
          loading={list.loading}
          error={list.error}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          requesterFilter={requesterFilter}
          onRequesterFilterChange={setRequesterFilter}
          sort={sort}
          onSortChange={setSort}
          branches={branches}
          onOpen={openDetail}
          onNew={startCreate}
          onExport={() => setExportOpen(true)}
          canCreate={can.canCreate}
          canExport={can.canExport}
        />
      )}

      {view === 'detail' && (
        <Loader loading={detail.loading} error={detail.error} onRetry={detail.refetch}>
          {detail.request && (
            <RequestDetail
              request={detail.request}
              statusPending={statusPending}
              onSetStatus={changeStatus}
              onEdit={startEdit}
              onDelete={() => setConfirmingDelete(true)}
              canEdit={can.canEdit(detail.request)}
              canDelete={can.canDelete}
              canSetStatus={can.canSetStatus}
            />
          )}
        </Loader>
      )}

      {view === 'form' && (
        <RequestForm
          mode={editing ? 'edit' : 'create'}
          values={editing ? toDraft(editing) : undefined}
          submitting={submitting}
          error={formError}
          fieldErrors={formFieldErrors}
          onCancel={goList}
          onSubmit={submitForm}
        />
      )}

      {confirmingDelete && detail.request && (
        <ConfirmDialog
          title="Delete request"
          message={`${detail.request.first} ${detail.request.last} (NPI ${detail.request.npi}) will be removed from the queue. This cannot be undone from the app.`}
          confirmLabel="Delete request"
          busy={deleting}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

      {exportOpen && (
        <ExportDialog
          exporting={exporting}
          onCancel={() => setExportOpen(false)}
          onConfirm={confirmExport}
        />
      )}
    </>
  );
}

function Loader({ loading, error, onRetry, children }: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (loading) return <DetailSkeleton />;
  if (error) return <Notice text={error} onRetry={onRetry} />;
  return <>{children}</>;
}

function Notice({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '48px var(--page-gutter)', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
      {text}
      {onRetry && (
        <div style={{ marginTop: '12px' }}>
          <span className="lnk" onClick={onRetry} style={{ cursor: 'pointer', color: 'var(--blue-500)' }}>Retry</span>
        </div>
      )}
    </div>
  );
}
