import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useConfirm } from '../ConfirmDialog';
import {
  MagnifyingGlass, Calendar, MapPin, UserCircle,
  X, Check, Clock, Download, Trash, Money,
  ArrowRight,
} from '@phosphor-icons/react';
import { t } from 'i18next';

interface Reservation {
  id: number;
  user_id: number;
  trip_id: number;
  selected_seat: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  user?: { name: string; first_name: string; email: string; phone: string };
  trip?: { id: number; departure_date: string; departure_time: string; departure: { city_name: string }; destination: { city_name: string }; bus: { bus_name: string } };
  payment?: { status: string; amount: number; payment_method: string };
}

const ReservationManagement = () => {
  const { confirm }   = useConfirm();
  const [reservations, setReservations]             = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [searchTerm, setSearchTerm]                 = useState('');
  const [statusFilter, setStatusFilter]             = useState<string>('all');
  const [dateFilter, setDateFilter]                 = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0, totalRevenue: 0 });

  useEffect(() => { fetchReservations(); }, []);
  useEffect(() => { filterReservations(); }, [reservations, searchTerm, statusFilter, dateFilter]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/reservations', { headers: { Authorization: `Bearer ${token}` } });
      const data = response.data.data || [];
      setReservations(data);
      setStats({
        total: data.length,
        pending:   data.filter((r: Reservation) => r.status === 'pending').length,
        confirmed: data.filter((r: Reservation) => r.status === 'confirmed').length,
        cancelled: data.filter((r: Reservation) => r.status === 'cancelled').length,
        totalRevenue: data.filter((r: Reservation) => r.status === 'confirmed').reduce((s: number, r: Reservation) => s + r.total_price, 0),
      });
    } catch { toast.error('Erreur lors du chargement des réservations'); }
    finally { setLoading(false); }
  };

  const filterReservations = () => {
    let f = [...reservations];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(r =>
        r.id.toString().includes(q) || r.user?.name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) || r.selected_seat?.toLowerCase().includes(q) ||
        r.trip?.departure?.city_name?.toLowerCase().includes(q) || r.trip?.destination?.city_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') f = f.filter(r => r.status === statusFilter);
    if (dateFilter) f = f.filter(r => r.trip?.departure_date === dateFilter);
    setFilteredReservations(f);
  };

  const handleCancel = async (id: number) => {
    if (!(await confirm('Annuler cette réservation ?'))) return;
    try {
      await api.delete(`/reservations/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Réservation annulée');
      fetchReservations();
    } catch (error: any) { toast.error(error.response?.data?.message || "Erreur d'annulation"); }
  };

  const handleExtend = async (id: number) => {
    try {
      await api.post(`/reservations/${id}/extend-delay`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Délai accordé (+2h)');
      fetchReservations();
    } catch (error: any) { toast.error(error.response?.data?.message || 'Erreur extension'); }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Voyageur', 'Email', 'Téléphone', 'Trajet', 'Date', 'Siège', 'Prix', 'Statut'];
    const rows = filteredReservations.map(r => [
      r.id, `${r.user?.first_name} ${r.user?.name}`, r.user?.email || '',
      r.user?.phone || '', `${r.trip?.departure?.city_name} → ${r.trip?.destination?.city_name}`,
      r.trip?.departure_date || '', r.selected_seat, r.total_price, r.status,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export réussi !');
  };

  const statusBadge = (status: string) => {
    const cfg: Record<string, { cls: string; label: string }> = {
      confirmed: { cls: 'bg-success/10 text-success border border-success/20',         label: 'Confirmée'  },
      pending:   { cls: 'bg-amber-100 text-amber-700 border border-amber-200',         label: 'En attente' },
      cancelled: { cls: 'bg-danger/10 text-danger border border-danger/20',            label: 'Annulée'    },
    };
    const { cls, label } = cfg[status] ?? { cls: 'bg-neutral-100 text-neutral-500', label: status };
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>{label}</span>;
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  const statsCards = [
    { label: 'Total',      value: stats.total,        color: 'bg-blue-500',   icon: Calendar  },
    { label: 'En attente', value: stats.pending,       color: 'bg-amber-500',  icon: Clock     },
    { label: 'Confirmées', value: stats.confirmed,     color: 'bg-green-500',  icon: Check     },
    { label: 'Annulées',   value: stats.cancelled,     color: 'bg-red-500',    icon: X         },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark tracking-tight">Gestion des Réservations</h2>
          <p className="text-neutral-400 text-sm font-medium mt-1 uppercase tracking-wider">Toutes les réservations de tickets</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-neutral-100 rounded-xl font-bold shadow-sm hover:bg-neutral-50 transition uppercase text-xs tracking-widest text-dark">
          <Download size={18} weight="bold" /> Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {statsCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={20} weight="fill" className="text-white" />
            </div>
            <p className="text-2xl font-bold text-dark">{s.value}</p>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenus */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
          <Money size={24} weight="fill" className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Revenus confirmés</p>
          <p className="text-2xl font-bold text-dark">{stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-neutral-400">FCFA</span></p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input type="text" placeholder="Nom, email, ville, siège..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium">
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium" />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                {['#', 'Voyageur', 'Trajet', 'Date', 'Siège', 'Prix', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredReservations.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={32} className="text-neutral-200" weight="duotone" />
                  </div>
                  <p className="text-neutral-400 font-medium">Aucune réservation trouvée</p>
                </td></tr>
              ) : filteredReservations.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50/50 transition-colors cursor-pointer" onClick={() => setSelectedReservation(r)}>
                  <td className="px-6 py-4 font-mono text-sm text-neutral-400">#{r.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={18} weight="fill" className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark text-sm">{r.user?.first_name} {r.user?.name}</p>
                        <p className="text-xs text-neutral-400">{r.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-dark">
                      <MapPin size={13} className="text-primary flex-shrink-0" weight="fill" />
                      {r.trip?.departure?.city_name}
                      <ArrowRight size={12} className="text-neutral-400" weight="bold" />
                      {r.trip?.destination?.city_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{new Date(r.trip?.departure_date || '').toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{r.selected_seat}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-dark text-sm">{r.total_price.toLocaleString()} <span className="text-xs font-normal text-neutral-400">FCFA</span></td>
                  <td className="px-6 py-4">{statusBadge(r.status)}</td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {r.status === 'pending' && (
                        <button onClick={() => handleExtend(r.id)} title="Accorder délai +2h"
                          className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                          <Clock size={16} weight="bold" />
                        </button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(r.id)} title="Annuler"
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash size={16} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h3 className="text-xl font-bold text-dark">Réservation #{selectedReservation.id}</h3>
                <div className="mt-1">{statusBadge(selectedReservation.status)}</div>
              </div>
              <button onClick={() => setSelectedReservation(null)} className="p-2 hover:bg-white rounded-xl transition text-neutral-400">
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              {[
                { title: 'Voyageur', rows: [
                  ['Nom', `${selectedReservation.user?.first_name} ${selectedReservation.user?.name}`],
                  ['Email', selectedReservation.user?.email || '—'],
                  ['Téléphone', selectedReservation.user?.phone || '—'],
                ]},
                { title: 'Voyage', rows: [
                  ['Trajet', `${selectedReservation.trip?.departure?.city_name} → ${selectedReservation.trip?.destination?.city_name}`],
                  ['Date', new Date(selectedReservation.trip?.departure_date || '').toLocaleDateString('fr-FR')],
                  ['Heure', selectedReservation.trip?.departure_time || '—'],
                  ['Bus', selectedReservation.trip?.bus?.bus_name || '—'],
                  ['Siège', selectedReservation.selected_seat],
                ]},
                ...(selectedReservation.payment ? [{ title: 'Paiement', rows: [
                  ['Montant', `${selectedReservation.payment.amount.toLocaleString()} FCFA`],
                  ['Méthode', selectedReservation.payment.payment_method],
                  ['Statut', selectedReservation.payment.status],
                ]}] : []),
              ].map(section => (
                <div key={section.title}>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">{section.title}</p>
                  <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 border border-neutral-100">
                    {section.rows.map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="font-semibold text-neutral-500">{label}</span>
                        <span className="font-semibold text-dark">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setSelectedReservation(null)}
                className="w-full py-3.5 border border-neutral-100 rounded-2xl font-bold text-neutral-400 text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition mt-2">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
