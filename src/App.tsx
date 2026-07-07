import { useMemo, useState, type ReactNode } from 'react';
import { AppBar } from './ui/AppBar';
import { RequestsList } from './screens/RequestsList';
import { RequestDetail } from './screens/RequestDetail';
import { RequestForm } from './screens/RequestForm';
import { ExportDialog } from './screens/ExportDialog';
import { SEED } from './data/seed';
import { buildPhysicianXlsx, downloadBlob } from './data/exportXlsx';
import { EXPORTABLE_STATUSES } from './data/types';
import type { PhysicianRequest, RequestDraft, RequestStatus, StatusFilter } from './data/types';

type View = 'list' | 'detail' | 'form';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function today() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function exportFilename() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `PAT_Export_${d.getFullYear()}-${mm}-${dd}.xlsx`;
}

function toDraft(r: PhysicianRequest): RequestDraft {
  return {
    first: r.first, last: r.last, npi: r.npi, branch: r.branch, degree: r.degree,
    vitalAlerts: r.vitalAlerts, orderNotif: r.orderNotif,
    address: r.address, city: r.city, state: r.state, zip: r.zip, phone: r.phone, fax: r.fax,
    officeVital: r.officeVital, officeOrder: r.officeOrder,
  };
}

export function App() {
  const [requests, setRequests] = useState<PhysicianRequest[]>(SEED);
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const editing = requests.find((r) => r.id === editingId) ?? null;
  const exportable = requests.filter((r) => EXPORTABLE_STATUSES.includes(r.status));

  const branches = useMemo(
    () => Array.from(new Set(requests.map((r) => r.branch))).sort(),
    [requests],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesSearch = q === '' || `${r.first} ${r.last}`.toLowerCase().includes(q) || r.npi.includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesBranch = branchFilter === 'all' || r.branch === branchFilter;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [requests, search, statusFilter, branchFilter]);

  const changeStatus = (id: number, status: RequestStatus) =>
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  const openDetail = (id: number) => {
    setSelectedId(id);
    setView('detail');
  };

  const startCreate = () => {
    setEditingId(null);
    setView('form');
  };

  const startEdit = (id: number) => {
    setEditingId(id);
    setView('form');
  };

  const submitForm = (values: RequestDraft) => {
    if (editingId !== null) {
      setRequests((rs) => rs.map((r) => (r.id === editingId ? { ...r, ...values } : r)));
      setView('list');
      return;
    }
    const id = Math.max(0, ...requests.map((r) => r.id)) + 1;
    const newRequest: PhysicianRequest = { ...values, id, status: 'new', created: today(), submitter: 'I. Brooks' };
    setRequests((rs) => [newRequest, ...rs]);
    setView('list');
  };

  const confirmExport = async () => {
    try {
      const blob = await buildPhysicianXlsx(exportable);
      downloadBlob(blob, exportFilename());
    } finally {
      setExportOpen(false);
    }
  };

  const goList = () => setView('list');

  let crumb: ReactNode = null;
  if (view === 'detail' && selected) {
    crumb = (
      <><span className="lnk" onClick={goList}>Requests</span><span>/</span><span className="cur">{selected.first} {selected.last}</span></>
    );
  }
  if (view === 'form') {
    crumb = (
      <><span className="lnk" onClick={goList}>Requests</span><span>/</span><span className="cur">{editing ? `${editing.first} ${editing.last}` : 'New request'}</span></>
    );
  }

  const role = view === 'form' ? 'Submitter' : 'Reviewer';
  const initials = role === 'Reviewer' ? 'WT' : 'IB';

  return (
    <>
      <AppBar crumb={crumb} role={role} initials={initials} />

      {view === 'list' && (
        <RequestsList
          requests={visible}
          totalCount={requests.length}
          exportableCount={exportable.length}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          branches={branches}
          onOpen={openDetail}
          onNew={startCreate}
          onExport={() => setExportOpen(true)}
        />
      )}

      {view === 'detail' && selected && (
        <RequestDetail
          request={selected}
          onSetStatus={(status) => changeStatus(selected.id, status)}
          onEdit={() => startEdit(selected.id)}
        />
      )}

      {view === 'form' && (
        <RequestForm
          mode={editing ? 'edit' : 'create'}
          values={editing ? toDraft(editing) : undefined}
          onCancel={goList}
          onSubmit={submitForm}
          onSaveDraft={submitForm}
        />
      )}

      {exportOpen && (
        <ExportDialog
          requests={exportable}
          filename={exportFilename()}
          onCancel={() => setExportOpen(false)}
          onConfirm={confirmExport}
        />
      )}
    </>
  );
}
