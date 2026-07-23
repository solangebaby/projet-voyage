import { useState, useEffect, useCallback } from 'react';
import {
  adminGetAgencies,
  adminGetAgencyStats,
  adminApproveAgency,
  adminSuspendAgency,
  adminRejectAgency,
} from '../../services/api';

interface AgencyRow {
  id: number;
  agency_name: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  trips_count?: number;
  destination?: { city_name: string };
  user?: { name: string; first_name: string; email: string; status: string; created_at: string };
}

interface Stats { total: number; active: number; pending: number; suspended: number }
201
4
export default function AgencyManagement() {
  const [stats, setStats]       = useState<Stats>({ total: 0, active: 0, pending: 0, suspended: 0 });
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage]         = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm]   = useState<{ msg: string; fn: () => void } | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = useCallback(async () => {
    try {
      const d = await adminGetAgencyStats();
      setStats(d.data || d);
    } catch { /* silent */ }
  }, []);

  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const d = await adminGetAgencies(params);
      const payload = d.data || d;
      if (payload.data) {
        setAgencies(payload.data);
        setLastPage(payload.last_page || 1);
      } else {
        setAgencies(Array.isArray(payload) ? payload : []);
      }
    } catch { flash('Erreur chargement agences', false); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchAgencies(); }, [fetchAgencies]);

  const ask = (msg: string, fn: () => void) => setConfirm({ msg, fn });

  const doApprove = (id: number) => ask('Approuver cette agence ?', async () => {
    try { await adminApproveAgency(id); flash('Agence approuvée ✓'); fetchAgencies(); fetchStats(); }
    catch { flash('Erreur', false); }
  });
  const doSuspend = (id: number) => ask('Suspendre cette agence ?', async () => {
    try { await adminSuspendAgency(id); flash('Agence suspendue'); fetchAgencies(); fetchStats(); }
    catch { flash('Erreur', false); }
  });
  const doReject = (id: number) => ask('Rejeter cette agence ?', async () => {
    try { await adminRejectAgency(id); flash('Agence rejetée'); fetchAgencies(); fetchStats(); }
    catch { flash('Erreur', false); }
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800', rejected: 'bg-gray-200 text-gray-700',
    };
    const labels: Record<string, string> = { active: 'Active', pending: 'En attente', suspended: 'Suspendue', rejected: 'Rejetée' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || 'bg-gray-100 text-gray-600'}`}>{labels[s] || s}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Agences</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Actives', value: stats.active, color: 'text-green-600' },
            { label: 'En attente', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Suspendues', value: stats.suspended, color: 'text-red-600' },
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
            placeholder="Rechercher une agence..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendue</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {['Agence', 'Contact', 'Destination', 'Voyages', 'Statut', 'Inscription', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center"><div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></td></tr>
                ) : agencies.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Aucune agence trouvée</td></tr>
                ) : agencies.map(a => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{a.agency_name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      <div>{a.phone || '-'}</div>
                      <div className="text-xs text-gray-400">{a.user?.email || ''}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{a.destination?.city_name || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{a.trips_count ?? '-'}</td>
                    <td className="px-5 py-3">{statusBadge(a.user?.status || 'pending')}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {a.user?.created_at ? new Date(a.user.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {a.user?.status === 'pending' && <>
                          <button onClick={() => doApprove(a.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">✅ Approuver</button>
                          <button onClick={() => doReject(a.id)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">❌ Rejeter</button>
                        </>}
                        {a.user?.status === 'active' && (
                          <button onClick={() => doSuspend(a.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">🚫 Suspendre</button>
                        )}
                        {a.user?.status === 'suspended' && (
                          <button onClick={() => doApprove(a.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">↩ Réactiver</button>
                        )}
                      </div>
                    </td>
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

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-xl text-white shadow-lg z-50 ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl mx-4">
            <p className="text-gray-800 mb-6 text-center">{confirm.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={() => { confirm.fn(); setConfirm(null); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
