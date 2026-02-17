import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Badge } from '../atoms/Badge';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useConfirm } from '../ConfirmDialog';
import {
  MagnifyingGlass,
  Calendar,
  MapPin,
  User,

  X,
  Check,
  Clock,
  Download,
  Trash,
  Money,
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
  user?: {
    name: string;
    first_name: string;
    email: string;
    phone: string;
  };
  trip?: {
    id: number;
    departure_date: string;
    departure_time: string;
    departure: { city_name: string };
    destination: { city_name: string };
    bus: { bus_name: string };
  };
  payment?: {
    status: string;
    amount: number;
    payment_method: string;
  };
}

const ReservationManagement = () => {
  const { confirm } = useConfirm();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = response.data.data || [];
      setReservations(data);
      calculateStats(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des réservations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Reservation[]) => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const confirmed = data.filter(r => r.status === 'confirmed').length;
    const cancelled = data.filter(r => r.status === 'cancelled').length;
    const totalRevenue = data
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + r.total_price, 0);

    setStats({ total, pending, confirmed, cancelled, totalRevenue });
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(r => {
        const searchLower = searchTerm.toLowerCase();
        return (
          r.id.toString().includes(searchLower) ||
          r.user?.name?.toLowerCase().includes(searchLower) ||
          r.user?.email?.toLowerCase().includes(searchLower) ||
          r.selected_seat?.toLowerCase().includes(searchLower) ||
          r.trip?.departure?.city_name?.toLowerCase().includes(searchLower) ||
          r.trip?.destination?.city_name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filtre par date
    if (dateFilter) {
      filtered = filtered.filter(r => {
        const tripDate = r.trip?.departure_date;
        return tripDate === dateFilter;
      });
    }

    setFilteredReservations(filtered);
  };

  const handleCancelReservation = async (id: number) => {
    const confirmed = await confirm('Êtes-vous sûr de vouloir annuler cette réservation ?');
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Réservation annulée avec succès');
      fetchReservations();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'annulation';
      toast.error(message);
      console.error(error);
    }
  };

  const handleExtendPaymentDelay = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/reservations/${id}/extend-delay`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Délai de paiement accordé (+2 heures)');
      fetchReservations();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'extension du délai';
      toast.error(message);
    }
  };

  const viewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const exportToExcel = () => {
    // Créer les données CSV
    const headers = [t('admin.reservations.id'), t('admin.reservations.traveler'), t('admin.reservations.email'), t('admin.reservations.phone'), t('admin.reservations.route'), t('admin.reservations.date'), t('admin.reservations.seat'), t('admin.reservations.price'), t('admin.reservations.status')];
    const rows = filteredReservations.map(r => [
      r.id,
      `${r.user?.first_name} ${r.user?.name}`,
      r.user?.email || '',
      r.user?.phone || '',
      `${r.trip?.departure?.city_name} → ${r.trip?.destination?.city_name}`,
      r.trip?.departure_date || '',
      r.selected_seat,
      r.total_price,
      r.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Export réussi !');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmée</Badge>;
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Annulée</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-dark">Gestion des Réservations</h1>
          <p className="text-gray-500 mt-1">Gérez toutes les réservations de tickets</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-dark">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar size={24} className="text-blue" weight="duotone" />
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
              <p className="text-sm text-gray-500">Confirmées</p>
              <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <Check size={24} className="text-success" weight="duotone" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Annulées</p>
              <p className="text-2xl font-bold text-danger">{stats.cancelled}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <X size={24} className="text-danger" weight="duotone" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenus</p>
              <p className="text-2xl font-bold text-primary">{stats.totalRevenue.toLocaleString()} FCFA</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Money size={24} className="text-primary" weight="duotone" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder={t('admin.reservations.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlass size={20} />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'confirmed', label: 'Confirmées' },
              { value: 'cancelled', label: 'Annulées' },
            ]}
            leftIcon={<Check size={20} />}
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

      {/* Liste des réservations */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Voyageur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Trajet</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">{t('admin.reservations.seat')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">{t('admin.reservations.price')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4 font-medium text-dark">#{reservation.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={20} className="text-gray-400" weight="duotone" />
                      <div>
                        <p className="font-medium text-dark">
                          {reservation.user?.first_name} {reservation.user?.name}
                        </p>
                        <p className="text-sm text-gray-500">{reservation.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className="text-primary" weight="duotone" />
                      <span className="text-gray-600">
                        {reservation.trip?.departure?.city_name} → {reservation.trip?.destination?.city_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(reservation.trip?.departure_date || '').toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{reservation.selected_seat}</Badge>
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {reservation.total_price.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(reservation.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewDetails(reservation)}
                        className="p-2 text-blue hover:bg-blue-50 rounded-lg transition"
                        title="Voir détails"
                      >
                        <MagnifyingGlass size={18} weight="bold" />
                      </button>
                      
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleExtendPaymentDelay(reservation.id)}
                          className="p-2 text-warning hover:bg-warning-100 rounded-lg transition"
                          title="Accorder délai (+2h)"
                        >
                          <Clock size={18} weight="bold" />
                        </button>
                      )}

                      {reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="p-2 text-danger hover:bg-danger-100 rounded-lg transition"
                          title={t('admin.reservations.cancelReservation')}
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-3" weight="duotone" />
            <p className="text-gray-500">Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-dark">Détails de la Réservation</h2>
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
                  <p className="text-sm text-gray-500">ID Réservation</p>
                  <p className="text-lg font-semibold">#{selectedReservation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-dark mb-3">Voyageur</h3>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Nom:</span> {selectedReservation.user?.first_name} {selectedReservation.user?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedReservation.user?.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedReservation.user?.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-dark mb-3">Détails du Voyage</h3>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Trajet:</span> {selectedReservation.trip?.departure?.city_name} → {selectedReservation.trip?.destination?.city_name}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedReservation.trip?.departure_date || '').toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Heure:</span> {selectedReservation.trip?.departure_time}</p>
                  <p><span className="font-medium">Bus:</span> {selectedReservation.trip?.bus?.bus_name}</p>
                  <p><span className="font-medium">{t('admin.reservations.seat')}:</span> {selectedReservation.selected_seat}</p>
                </div>
              </div>

              {selectedReservation.payment && (
                <div>
                  <h3 className="text-lg font-semibold text-dark mb-3">{t('admin.reservations.paymentInfo')}</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Montant:</span> {selectedReservation.payment.amount.toLocaleString()} FCFA</p>
                    <p><span className="font-medium">Méthode:</span> {selectedReservation.payment.payment_method}</p>
                    <p><span className="font-medium">Statut:</span> {selectedReservation.payment.status}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
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

export default ReservationManagement;
