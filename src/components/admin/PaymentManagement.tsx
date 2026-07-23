import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useConfirm } from '../ConfirmDialog';
import {
  MagnifyingGlass, CreditCard, CheckCircle, XCircle,
  Clock, ArrowsClockwise, Download, X, Calendar, Money, UserCircle,
} from '@phosphor-icons/react';

interface Payment {
  id: number;
  reservation_id: number;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  reservation?: {
    id: number;
    selected_seat: string;
    user: { name: string; first_name: string; email: string };
    trip: { departure_date: string; departure: { city_name: string }; destination: { city_name: string } };
  };
}

const METHOD_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money', orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo', card: 'Carte Bancaire', cash: 'Espèces',
};

const PaymentManagement = () => {
  const { confirm }   = useConfirm();
  const [payments, setPayments]                     = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments]     = useState<Payment[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [searchTerm, setSearchTerm]                 = useState('');
  const [statusFilter, setStatusFilter]             = useState<string>('all');
  const [methodFilter, setMethodFilter]             = useState<string>('all');
  const [dateFilter, setDateFilter]                 = useState('');
  const [selectedPayment, setSelectedPayment]       = useState<Payment | null>(null);
  const [processing, setProcessing]                 = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, failed: 0, refunded: 0, totalAmount: 0, completedAmount: 0 });

  useEffect(() => { fetchPayments(); }, []);
  useEffect(() => { filterPayments(); }, [payments, searchTerm, statusFilter, methodFilter, dateFilter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/payments', { headers: { Authorization: `Bearer ${token}` } });
      const data = response.data.data || [];
      setPayments(data);
      setStats({
        total: data.length,
        completed: data.filter((p: Payment) => p.status === 'completed').length,
        pending:   data.filter((p: Payment) => p.status === 'pending').length,
        failed:    data.filter((p: Payment) => p.status === 'failed').length,
        refunded:  data.filter((p: Payment) => p.status === 'refunded').length,
        totalAmount:     data.reduce((s: number, p: Payment) => s + p.amount, 0),
        completedAmount: data.filter((p: Payment) => p.status === 'completed').reduce((s: number, p: Payment) => s + p.amount, 0),
      });
    } catch { toast.error('Erreur lors du chargement des paiements'); }
    finally { setLoading(false); }
  };

  const filterPayments = () => {
    let f = [...payments];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(p =>
        p.id.toString().includes(q) || p.transaction_id?.toLowerCase().includes(q) ||
        p.reservation?.user?.name?.toLowerCase().includes(q) || p.reservation?.user?.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') f = f.filter(p => p.status === statusFilter);
    if (methodFilter !== 'all') f = f.filter(p => p.payment_method === methodFilter);
    if (dateFilter) f = f.filter(p => new Date(p.created_at).toISOString().split('T')[0] === dateFilter);
    setFilteredPayments(f);
  };

  const handleVerify = async (id: number) => {
    setProcessing(true);
    try {
      await api.post(`/payments/${id}/verify`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Vérification effectuée');
      fetchPayments();
    } catch (error: any) { toast.error(error.response?.data?.message || 'Erreur de vérification'); }
    finally { setProcessing(false); }
  };

  const handleRefund = async (id: number) => {
    if (!(await confirm('Rembourser ce paiement ?'))) return;
    setProcessing(true);
    try {
      await api.post(`/payments/${id}/refund`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Remboursement effectué');
      fetchPayments();
    } catch (error: any) { toast.error(error.response?.data?.message || 'Erreur de remboursement'); }
    finally { setProcessing(false); }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Transaction', 'Voyageur', 'Montant', 'Méthode', 'Statut', 'Date'];
    const rows = filteredPayments.map(p => [
      p.id, p.transaction_id || 'N/A',
      `${p.reservation?.user?.first_name} ${p.reservation?.user?.name}`,
      p.amount, p.payment_method, p.status,
      new Date(p.created_at).toLocaleDateString('fr-FR'),
    ]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[headers, ...rows].map(r => r.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export réussi !');
  };

  const statusBadge = (status: string) => {
    const cfg: Record<string, { cls: string; label: string }> = {
      completed: { cls: 'bg-success/10 text-success border border-success/20',   label: 'Complété'    },
      pending:   { cls: 'bg-amber-100 text-amber-700 border border-amber-200',   label: 'En attente'  },
      failed:    { cls: 'bg-danger/10 text-danger border border-danger/20',      label: 'Échoué'      },
      refunded:  { cls: 'bg-blue-100 text-blue-700 border border-blue-200',      label: 'Remboursé'   },
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
    { label: 'Total',      value: stats.total,     color: 'bg-blue-500',   icon: CreditCard      },
    { label: 'Complétés',  value: stats.completed, color: 'bg-green-500',  icon: CheckCircle     },
    { label: 'En attente', value: stats.pending,   color: 'bg-amber-500',  icon: Clock           },
    { label: 'Échoués',    value: stats.failed,    color: 'bg-red-500',    icon: XCircle         },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark tracking-tight">Gestion des Paiements</h2>
          <p className="text-neutral-400 text-sm font-medium mt-1 uppercase tracking-wider">Toutes les transactions</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { label: 'Revenus confirmés', value: stats.completedAmount, color: 'bg-green-500' },
          { label: 'Volume total',       value: stats.totalAmount,     color: 'bg-neutral-700' },
        ].map(r => (
          <div key={r.label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center`}>
              <Money size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{r.label}</p>
              <p className="text-2xl font-bold text-dark">{r.value.toLocaleString()} <span className="text-sm font-normal text-neutral-400">FCFA</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input type="text" placeholder="ID, transaction, nom..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium">
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
            <option value="refunded">Remboursés</option>
          </select>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium">
            <option value="all">Toutes les méthodes</option>
            {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                {['#', 'Transaction', 'Voyageur', 'Montant', 'Méthode', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={32} className="text-neutral-200" weight="duotone" />
                  </div>
                  <p className="text-neutral-400 font-medium">Aucun paiement trouvé</p>
                </td></tr>
              ) : filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors cursor-pointer" onClick={() => setSelectedPayment(p)}>
                  <td className="px-6 py-4 font-mono text-sm text-neutral-400">#{p.id}</td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500">{p.transaction_id || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={16} weight="fill" className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark text-sm">{p.reservation?.user?.first_name} {p.reservation?.user?.name}</p>
                        <p className="text-xs text-neutral-400">{p.reservation?.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-dark">{p.amount.toLocaleString()} <span className="text-xs font-normal text-neutral-400">FCFA</span></td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold">{METHOD_LABELS[p.payment_method] || p.payment_method}</span>
                  </td>
                  <td className="px-6 py-4">{statusBadge(p.status)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {p.status === 'pending' && (
                        <button onClick={() => handleVerify(p.id)} disabled={processing} title="Vérifier"
                          className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition disabled:opacity-50">
                          <ArrowsClockwise size={16} weight="bold" />
                        </button>
                      )}
                      {p.status === 'completed' && (
                        <button onClick={() => handleRefund(p.id)} disabled={processing} title="Rembourser"
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                          <ArrowsClockwise size={16} weight="bold" />
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
      {selectedPayment && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h3 className="text-xl font-bold text-dark">Paiement #{selectedPayment.id}</h3>
                <div className="mt-1">{statusBadge(selectedPayment.status)}</div>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-white rounded-xl transition text-neutral-400">
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              {[
                { title: 'Transaction', rows: [
                  ['ID Transaction', selectedPayment.transaction_id || '—'],
                  ['Montant', `${selectedPayment.amount.toLocaleString()} FCFA`],
                  ['Méthode', METHOD_LABELS[selectedPayment.payment_method] || selectedPayment.payment_method],
                  ['Date', new Date(selectedPayment.created_at).toLocaleString('fr-FR')],
                ]},
                ...(selectedPayment.reservation ? [{ title: 'Voyageur', rows: [
                  ['Nom', `${selectedPayment.reservation.user?.first_name} ${selectedPayment.reservation.user?.name}`],
                  ['Email', selectedPayment.reservation.user?.email || '—'],
                ]}, { title: 'Voyage', rows: [
                  ['Trajet', `${selectedPayment.reservation.trip?.departure?.city_name} → ${selectedPayment.reservation.trip?.destination?.city_name}`],
                  ['Date', new Date(selectedPayment.reservation.trip?.departure_date || '').toLocaleDateString('fr-FR')],
                  ['Siège', selectedPayment.reservation.selected_seat],
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
              <div className="flex gap-3 pt-2">
                {selectedPayment.status === 'pending' && (
                  <button onClick={() => { handleVerify(selectedPayment.id); setSelectedPayment(null); }} disabled={processing}
                    className="flex-1 py-3.5 bg-amber-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-amber-600 disabled:opacity-50 transition">
                    Vérifier le statut
                  </button>
                )}
                {selectedPayment.status === 'completed' && (
                  <button onClick={() => { handleRefund(selectedPayment.id); setSelectedPayment(null); }} disabled={processing}
                    className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 transition">
                    Rembourser
                  </button>
                )}
                <button onClick={() => setSelectedPayment(null)}
                  className="flex-1 py-3.5 border border-neutral-100 rounded-2xl font-bold text-neutral-400 text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
