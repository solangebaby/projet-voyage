import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Badge } from '../atoms/Badge';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useConfirm } from '../ConfirmDialog';
import {
  MagnifyingGlass,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ArrowsClockwise,
  Download,
  X,
  Calendar,
  Money,
} from '@phosphor-icons/react';

interface Payment {
  id: number;
  reservation_id: number;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  reservation?: {
    id: number;
    selected_seat: string;
    user: {
      name: string;
      first_name: string;
      email: string;
    };
    trip: {
      departure_date: string;
      departure: { city_name: string };
      destination: { city_name: string };
    };
  };
}

const PaymentManagement = () => {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    completedAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = response.data.data || [];
      setPayments(data);
      calculateStats(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des paiements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Payment[]) => {
    const total = data.length;
    const completed = data.filter(p => p.status === 'completed').length;
    const pending = data.filter(p => p.status === 'pending').length;
    const failed = data.filter(p => p.status === 'failed').length;
    const refunded = data.filter(p => p.status === 'refunded').length;
    const totalAmount = data.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = data
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({ total, completed, pending, failed, refunded, totalAmount, completedAmount });
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return (
          p.id.toString().includes(searchLower) ||
          p.transaction_id?.toLowerCase().includes(searchLower) ||
          p.reservation?.user?.name?.toLowerCase().includes(searchLower) ||
          p.reservation?.user?.email?.toLowerCase().includes(searchLower) ||
          p.payment_method?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filtre par méthode
    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_method === methodFilter);
    }

    // Filtre par date
    if (dateFilter) {
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.created_at).toISOString().split('T')[0];
        return paymentDate === dateFilter;
      });
    }

    setFilteredPayments(filtered);
  };

  const handleVerifyPayment = async (id: number) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/payments/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Vérification effectuée');
      fetchPayments();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la vérification';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRefundPayment = async (id: number) => {
    const confirmed = await confirm('Êtes-vous sûr de vouloir rembourser ce paiement ?');
    if (!confirmed) {
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/payments/${id}/refund`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success(t('admin.payments.refundSuccess'));
      fetchPayments();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors du remboursement';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const viewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Transaction', 'Voyageur', 'Montant', 'Méthode', 'Statut', 'Date'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.transaction_id || 'N/A',
      `${p.reservation?.user?.first_name} ${p.reservation?.user?.name}`,
      p.amount,
      p.payment_method,
      p.status,
      new Date(p.created_at).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Export réussi !');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Complété</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Échoué</Badge>;
      case 'refunded':
        return <Badge variant="info">Remboursé</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const methodLabels: { [key: string]: string } = {
      'mobile_money': 'Mobile Money',
      'orange_money': 'Orange Money',
      'mtn_momo': 'MTN MoMo',
      'card': 'Carte Bancaire',
      'cash': 'Espèces',
    };

    return <Badge variant="neutral">{methodLabels[method] || method}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark">{t('admin.payments.title')}</h1>
          <p className="text-gray-500 mt-1">Consultez et gérez toutes les transactions</p>
        </div>
        <Button
          onClick={exportToExcel}
          leftIcon={<Download size={20} weight="bold" />}
          variant="secondary"
        >
          Exporter
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('admin.payments.totalPayments')}</p>
              <p className="text-2xl font-bold text-dark">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard size={24} className="text-blue" weight="duotone" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Complétés</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle size={24} className="text-success" weight="duotone" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Clock size={24} className="text-warning" weight="duotone" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenus Totaux</p>
              <p className="text-xl font-bold text-primary">{stats.completedAmount.toLocaleString()} FCFA</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Money size={24} className="text-primary" weight="duotone" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle size={32} className="text-danger" weight="duotone" />
            <div>
              <p className="text-sm text-gray-500">Échoués</p>
              <p className="text-xl font-bold text-danger">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowsClockwise size={32} className="text-info" weight="duotone" />
            <div>
              <p className="text-sm text-gray-500">Remboursés</p>
              <p className="text-xl font-bold text-info">{stats.refunded}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Money size={32} className="text-secondary" weight="duotone" />
            <div>
              <p className="text-sm text-gray-500">Montant Total</p>
              <p className="text-xl font-bold text-secondary">{stats.totalAmount.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={t('admin.payments.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlass size={20} />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'completed', label: 'Complétés' },
              { value: 'pending', label: 'En attente' },
              { value: 'failed', label: 'Échoués' },
              { value: 'refunded', label: 'Remboursés' },
            ]}
            leftIcon={<CheckCircle size={20} />}
          />

          <Select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Toutes les méthodes' },
              { value: 'mobile_money', label: 'Mobile Money' },
              { value: 'orange_money', label: 'Orange Money' },
              { value: 'mtn_momo', label: 'MTN MoMo' },
              { value: 'card', label: 'Carte Bancaire' },
            ]}
            leftIcon={<CreditCard size={20} />}
          />

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            leftIcon={<Calendar size={20} />}
            placeholder="Filtrer par date"
          />
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Transaction</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Voyageur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Montant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Méthode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4 font-medium text-dark">#{payment.id}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                    {payment.transaction_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-dark">
                        {payment.reservation?.user?.first_name} {payment.reservation?.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{payment.reservation?.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {payment.amount.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">{getMethodBadge(payment.payment_method)}</td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(payment.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewDetails(payment)}
                        className="p-2 text-blue hover:bg-blue-50 rounded-lg transition"
                        title="Voir détails"
                      >
                        <MagnifyingGlass size={18} weight="bold" />
                      </button>
                      
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyPayment(payment.id)}
                          disabled={processing}
                          className="p-2 text-warning hover:bg-warning-100 rounded-lg transition disabled:opacity-50"
                          title="Vérifier le statut"
                        >
                          <ArrowsClockwise size={18} weight="bold" />
                        </button>
                      )}

                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefundPayment(payment.id)}
                          disabled={processing}
                          className="p-2 text-danger hover:bg-danger-100 rounded-lg transition disabled:opacity-50"
                          title="Rembourser"
                        >
                          <ArrowsClockwise size={18} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-3" weight="duotone" />
            <p className="text-gray-500">Aucun paiement trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-dark">{t('admin.payments.paymentDetails')}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('admin.payments.paymentId')}</p>
                  <p className="text-lg font-semibold">#{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-dark mb-3">Transaction</h3>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">ID Transaction:</span> {selectedPayment.transaction_id || 'N/A'}</p>
                  <p><span className="font-medium">Montant:</span> {selectedPayment.amount.toLocaleString()} FCFA</p>
                  <p><span className="font-medium">Méthode:</span> {getMethodBadge(selectedPayment.payment_method)}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedPayment.created_at).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              {selectedPayment.reservation && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-3">Voyageur</h3>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Nom:</span> {selectedPayment.reservation.user?.first_name} {selectedPayment.reservation.user?.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedPayment.reservation.user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-3">Voyage</h3>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Trajet:</span> {selectedPayment.reservation.trip?.departure?.city_name} → {selectedPayment.reservation.trip?.destination?.city_name}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedPayment.reservation.trip?.departure_date || '').toLocaleDateString('fr-FR')}</p>
                      <p><span className="font-medium">{t('admin.reservations.seat')}:</span> {selectedPayment.reservation.selected_seat}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {selectedPayment.status === 'pending' && (
                  <Button
                    onClick={() => {
                      handleVerifyPayment(selectedPayment.id);
                      setShowDetailsModal(false);
                    }}
                    variant="secondary"
                    fullWidth
                    leftIcon={<ArrowsClockwise size={20} />}
                  >
                    Vérifier le statut
                  </Button>
                )}
                
                {selectedPayment.status === 'completed' && (
                  <Button
                    onClick={() => {
                      handleRefundPayment(selectedPayment.id);
                      setShowDetailsModal(false);
                    }}
                    variant="danger"
                    fullWidth
                    leftIcon={<ArrowsClockwise size={20} />}
                  >
                    Rembourser
                  </Button>
                )}

                <Button onClick={() => setShowDetailsModal(false)} variant="ghost" fullWidth>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
