import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Badge } from '../atoms/Badge';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useConfirm } from '../ConfirmDialog';
import {
  Plus,
  PencilSimple,
  Trash,
  CurrencyDollar,
  CalendarBlank,
  Users,
  X,
} from '@phosphor-icons/react';
import { t } from 'i18next';

interface Tarif {
  id: number;
  name: string;
  departure_id: number;
  destination_id: number;
  departure?: { id: number; city_name: string };
  destination?: { id: number; city_name: string };
  price_adult: number;
  price_student?: number;
  price_child?: number;
  valid_from?: string;
  valid_to?: string;
  valid_days?: string[];
  time_period: 'all' | 'day' | 'night';
  group_discount_percentage?: number;
  group_discount_min_passengers?: number;
  status: 'actif' | 'inactif';
}

interface City {
  id: number;
  city_name: string;
}

const TarifManagement = () => {
  const { confirm } = useConfirm();
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    departure_id: '',
    destination_id: '',
    price_adult: '',
    price_student: '',
    price_child: '',
    valid_from: '',
    valid_to: '',
    valid_days: [] as string[],
    time_period: 'all',
    group_discount_percentage: '',
    group_discount_min_passengers: '',
    status: 'actif',
  });

  const daysOfWeek = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' },
    { value: 'dimanche', label: 'Dimanche' },
  ];

  useEffect(() => {
    fetchTarifs();
    fetchCities();
  }, []);

  const fetchTarifs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/tarifs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTarifs(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des tarifs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCities(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
    }
  };

  const openModal = (tarif?: Tarif) => {
    if (tarif) {
      setEditingTarif(tarif);
      setFormData({
        name: tarif.name,
        departure_id: tarif.departure_id.toString(),
        destination_id: tarif.destination_id.toString(),
        price_adult: tarif.price_adult.toString(),
        price_student: tarif.price_student?.toString() || '',
        price_child: tarif.price_child?.toString() || '',
        valid_from: tarif.valid_from || '',
        valid_to: tarif.valid_to || '',
        valid_days: tarif.valid_days || [],
        time_period: tarif.time_period,
        group_discount_percentage: tarif.group_discount_percentage?.toString() || '',
        group_discount_min_passengers: tarif.group_discount_min_passengers?.toString() || '',
        status: tarif.status,
      });
    } else {
      setEditingTarif(null);
      setFormData({
        name: '',
        departure_id: '',
        destination_id: '',
        price_adult: '',
        price_student: '',
        price_child: '',
        valid_from: '',
        valid_to: '',
        valid_days: [],
        time_period: 'all',
        group_discount_percentage: '',
        group_discount_min_passengers: '',
        status: 'actif',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTarif(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.departure_id === formData.destination_id) {
      toast.error('La ville de départ et d\'arrivée ne peuvent pas être identiques');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        valid_days: formData.valid_days.length > 0 ? formData.valid_days : null,
      };

      if (editingTarif) {
        await api.put(`/tarifs/${editingTarif.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tarif mis à jour avec succès');
      } else {
        await api.post('/tarifs', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tarif créé avec succès');
      }

      fetchTarifs();
      closeModal();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      toast.error(message);
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?');
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/tarifs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tarif supprimé avec succès');
      fetchTarifs();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
      console.error(error);
    }
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      valid_days: prev.valid_days.includes(day)
        ? prev.valid_days.filter((d) => d !== day)
        : [...prev.valid_days, day],
    }));
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
          <h1 className="text-3xl font-bold text-dark">Gestion des Tarifs</h1>
          <p className="text-gray-500 mt-1">Gérez les tarifs par trajet et catégorie</p>
        </div>
        <Button
          onClick={() => openModal()}
          leftIcon={<Plus size={20} weight="bold" />}
          variant="primary"
        >
          Créer un tarif
        </Button>
      </div>

      {/* Liste des tarifs */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Trajet</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">{t('admin.pricing.adultPrice')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">{t('admin.pricing.studentPrice')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Validité</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {tarifs.map((tarif) => (
                <tr key={tarif.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CurrencyDollar size={20} className="text-primary" weight="duotone" />
                      <span className="font-medium text-dark">{tarif.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tarif.departure?.city_name} → {tarif.destination?.city_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary">{tarif.price_adult} FCFA</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {tarif.price_student ? `${tarif.price_student} FCFA` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {tarif.valid_from && tarif.valid_to
                        ? `${new Date(tarif.valid_from).toLocaleDateString('fr-FR')} - ${new Date(tarif.valid_to).toLocaleDateString('fr-FR')}`
                        : 'Toujours valide'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={tarif.status === 'actif' ? 'success' : 'neutral'} rounded>
                      {tarif.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(tarif)}
                        className="p-2 text-blue hover:bg-blue-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <PencilSimple size={18} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleDelete(tarif.id)}
                        className="p-2 text-danger hover:bg-danger-100 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tarifs.length === 0 && (
          <div className="text-center py-12">
            <CurrencyDollar size={48} className="mx-auto text-gray-300 mb-3" weight="duotone" />
            <p className="text-gray-500">Aucun tarif disponible</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-strong max-w-3xl w-full my-8 animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-dark">
                {editingTarif ? 'Modifier le tarif' : 'Créer un tarif'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nom du tarif"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Tarif Standard Yaoundé-Douala"
                    required
                  />
                </div>

                <Select
                  label="Ville de départ"
                  value={formData.departure_id}
                  onChange={(e) => setFormData({ ...formData, departure_id: e.target.value })}
                  options={cities.map((city) => ({ value: city.id, label: city.city_name }))}
                  placeholder="Sélectionner la ville de départ"
                  required
                />

                <Select
                  label="Ville d'arrivée"
                  value={formData.destination_id}
                  onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                  options={cities.map((city) => ({ value: city.id, label: city.city_name }))}
                  placeholder="Sélectionner la ville d'arrivée"
                  required
                />
              </div>

              {/* {t('admin.pricing.prices')} */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                  <CurrencyDollar size={20} className="text-primary" weight="duotone" />
                  Catégories de prix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('admin.pricing.adultPrice')}
                    type="number"
                    value={formData.price_adult}
                    onChange={(e) => setFormData({ ...formData, price_adult: e.target.value })}
                    placeholder="2500"
                    required
                  />
                  <Input
                    label={t('admin.pricing.studentPrice')}
                    type="number"
                    value={formData.price_student}
                    onChange={(e) => setFormData({ ...formData, price_student: e.target.value })}
                    placeholder="1500"
                  />
                  <Input
                    label={t('admin.pricing.childPrice')}
                    type="number"
                    value={formData.price_child}
                    onChange={(e) => setFormData({ ...formData, price_child: e.target.value })}
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Période de validité */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                  <CalendarBlank size={20} className="text-primary" weight="duotone" />
                  Période de validité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date de début"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                  <Input
                    label="Date de fin"
                    type="date"
                    value={formData.valid_to}
                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Jours applicables (laisser vide pour tous les jours)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          formData.valid_days.includes(day.value)
                            ? 'bg-primary text-white'
                            : 'bg-neutral-100 text-gray-700 hover:bg-neutral-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Select
                  label="Période de la journée"
                  value={formData.time_period}
                  onChange={(e) => setFormData({ ...formData, time_period: e.target.value as any })}
                  options={[
                    { value: 'all', label: 'Toute la journée' },
                    { value: 'day', label: 'Jour uniquement' },
                    { value: 'night', label: 'Nuit uniquement' },
                  ]}
                />
              </div>

              {/* Réduction groupe */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                  <Users size={20} className="text-primary" weight="duotone" />
                  Réduction groupe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Pourcentage de réduction (%)"
                    type="number"
                    value={formData.group_discount_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, group_discount_percentage: e.target.value })
                    }
                    placeholder="10"
                    helperText="Réduction appliquée pour les groupes"
                  />
                  <Input
                    label="Nombre minimum de passagers"
                    type="number"
                    value={formData.group_discount_min_passengers}
                    onChange={(e) =>
                      setFormData({ ...formData, group_discount_min_passengers: e.target.value })
                    }
                    placeholder="10"
                    helperText="Minimum pour bénéficier de la réduction"
                  />
                </div>
              </div>

              {/* Statut */}
              <Select
                label="Statut"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'actif', label: 'Actif' },
                  { value: 'inactif', label: 'Inactif' },
                ]}
              />

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={closeModal} variant="ghost" fullWidth>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  {editingTarif ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifManagement;
