import { useState, useEffect, useCallback } from 'react';
import {
  adminGetDisputes,
  adminGetDisputeStats,
  adminGetDispute,
  adminUpdateDispute,
} from '../../services/api';

interface DisputeRow {
  id: number;
  subject: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  resolution?: string;
  user?: { name: string; first_name: string; email: string };
  agency?: { agency_name: string };
  reservation?: { id: number; selected_seat?: string };
}
interface Stats { total: number; open: number; in_review: number; resolved: number; by_type?: any[] }

const TYPE_LABELS: Record<string, string> = {
  cancellation: 'Annulation', delay: 'Retard', overcharge: 'Surfacturation',
  quality: 'Qualité', lost_luggage: 'Bagage perdu', other: 'Autre',
};
const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert', in_review: 'En cours', resolved: 'Résolu', closed: 'Fermé', rejected: 'Rejeté',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800', in_review: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-200 text-gray-600',
  rejected: 'bg-gray-200 text-gray-600',
};

export default function DisputeManagement() {
  const [stats, setStats]           = useState<Stats>({ total: 0, open: 0, in_review: 0, resolved: 0 });
  const [disputes, setDisputes]     = useState<DisputeRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [lastPage, setLastPage]     = useState(1);
  const [selected, setSelected]     = useState<DisputeRow | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editResolution, setEditResolution] = useState('');
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = useCallback(async () => {
    try { const d = await adminGetDisputeStats(); setStats(d.data || d); } catch { /* silent */ }
  }, []);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all')   params.type   = typeFilter;
      if (search)                 params.search = search;
      const d = await adminGetDisputes(params);
      const payload = d.data || d;
      if (payload.data) {
        setDisputes(payload.data);
        setLastPage(payload.last_page || 1);
      } else {
        setDisputes(Array.isArray(payload) ? payload : []);
      }
    } catch { flash('Erreur chargement litiges', false); }
    finally { setLoading(false); }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const openModal = async (d: DisputeRow) => {
    try {
      const full = await adminGetDispute(d.id);
      const data = full.data || full;
      setSelected(data);
      setEditStatus(data.status);
      setEditResolution(data.resolution || '');
    } catch { setSelected(d); setEditStatus(d.status); setEditResolution(d.resolution || ''); }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminUpdateDispute(selected.id, { status: editStatus, resolution: editResolution });
      flash('Litige mis à jour ✓');
      setSelected(null);
      fetchDisputes();
      fetchStats();
    } catch { flash('Erreur sauvegarde', false); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Litiges &amp; Réclamations</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',     value: stats.total,     color: 'text-gray-900' },
            { label: 'Ouverts',   value: stats.open,      color: 'text-red-600' },
            { label: 'En cours',  value: stats.in_review, color: 'text-yellow-600' },
            { label: 'Résolus',   value: stats.resolved,  color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-3">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 min-w-48 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Rechercher dans les litiges..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {['#', 'Voyageur', 'Agence', 'Type', 'Sujet', 'Statut', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center">
                    <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                  </td></tr>
                ) : disputes.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">Aucun litige trouvé</td></tr>
                ) : disputes.map(d => (
                  <tr key={d.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => openModal(d)}>
                    <td className="px-5 py-3 text-gray-400 font-mono">#{d.id}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{d.user ? `${d.user.first_name} ${d.user.name}` : '-'}</div>
                      <div className="text-xs text-gray-400">{d.user?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{d.agency?.agency_name || '-'}</td>
                    <td className="px-5 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{TYPE_LABELS[d.type] || d.type}</span></td>
                    <td className="px-5 py-3 max-w-xs truncate text-gray-700">{d.subject}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[d.status] || 'bg-gray-100'}`}>{STATUS_LABELS[d.status] || d.status}</span></td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-3"><button className="text-blue-600 hover:underline text-xs">Voir / Traiter</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
            <span className="px-4 py-2 border rounded-lg bg-gray-50">Page {page} / {lastPage}</span>
            <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
          </div>
        )}
      </div>

      {/* Modal Détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Litige #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-gray-600">Voyageur:</span> {selected.user ? `${selected.user.first_name} ${selected.user.name}` : '-'}</div>
                <div><span className="font-semibold text-gray-600">Agence:</span> {selected.agency?.agency_name || '-'}</div>
                <div><span className="font-semibold text-gray-600">Type:</span> {TYPE_LABELS[selected.type] || selected.type}</div>
                <div><span className="font-semibold text-gray-600">Date:</span> {new Date(selected.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Sujet</p>
                <p className="text-gray-800 bg-gray-50 rounded-lg p-3">{selected.subject}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Description</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{selected.description}</p>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Résolution / Commentaire admin</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Décision prise, remboursement accordé..."
                  value={editResolution}
                  onChange={e => setEditResolution(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-xl text-white shadow-lg z-50 ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
