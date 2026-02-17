import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../ConfirmDialog';
import {
  Bus as BusIcon,
  Plus,
  Pencil,
  Trash,
  X,
  Armchair,
  Wrench
} from '@phosphor-icons/react';
import { t } from 'i18next';

interface Seat {
  id: string;
  row: number;
  column: string;
  position: string;
  type: string;
  status: string;
  equipment: string[];
}

interface BusData {
  id: number;
  bus_name: string;
  internal_number: string | null;
  registration: string;
  brand: string | null;
  year: number | null;
  type: 'standard' | 'vip';
  state: 'actif' | 'en_maintenance' | 'hors_service';
  total_seats: number;
  seat_configuration: string | Seat[];
  maintenance_note: string | null;
}

const BusFleetManagement = () => {
  const { confirm } = useConfirm();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const [formData, setFormData] = useState({
    bus_name: '',
    internal_number: '',
    registration: '',
    brand: '',
    year: new Date().getFullYear(),
    type: 'standard' as 'standard' | 'vip',
    total_seats: 50,
    state: 'actif' as 'actif' | 'en_maintenance' | 'hors_service',
    maintenance_note: ''
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      
      // Debug: vérifier le token
      if (!token) {
        console.error('Pas de token trouvé');
        toast.error('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }
      
      console.log('Fetching buses with token:', token?.substring(0, 20) + '...');
      
      const response = await axios.get('http://localhost:8000/api/fleet/buses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setBuses(response.data.data);
        toast.success(`${response.data.data.length} bus chargé(s)`);
      }
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Erreur lors du chargement des bus';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bus_name.trim()) {
      toast.error('Le nom du bus est requis');
      return;
    }

    if (!formData.registration.trim()) {
      toast.error('L\'immatriculation est requise');
      return;
    }

    if (formData.total_seats < 1 || formData.total_seats > 100) {
      toast.error('Le nombre de sièges doit être entre 1 et 100');
      return;
    }

    try {
      console.log('Submitting bus data:', formData);
      
      if (editingBus) {
        // Update bus
        console.log('Updating bus:', editingBus.id);
        const response = await axios.put(
          `http://localhost:8000/api/fleet/buses/${editingBus.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Update response:', response.data);
        
        if (response.data.success) {
          toast.success(response.data.message);
          if (response.data.warning) {
            toast(response.data.message, { icon: '⚠️', duration: 5000 });
          }
          fetchBuses();
          closeModal();
        }
      } else {
        // Create bus
        console.log('Creating new bus');
        const response = await axios.post(
          'http://localhost:8000/api/fleet/buses',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Create response:', response.data);
        
        if (response.data.success) {
          toast.success(response.data.message);
          fetchBuses();
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('Error saving bus:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        Object.values(error.response.data.errors).forEach((err: any) => {
          toast.error(err[0]);
        });
      } else {
        toast.error(message);
      }
    }
  };

  const handleEdit = (bus: BusData) => {
    setEditingBus(bus);
    setFormData({
      bus_name: bus.bus_name,
      internal_number: bus.internal_number || '',
      registration: bus.registration,
      brand: bus.brand || '',
      year: bus.year || new Date().getFullYear(),
      type: bus.type,
      total_seats: bus.total_seats,
      state: bus.state,
      maintenance_note: bus.maintenance_note || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (bus: BusData) => {
    const confirmed = await confirm(`Êtes-vous sûr de vouloir supprimer le bus ${bus.bus_name} ?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/fleet/buses/${bus.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchBuses();
      }
    } catch (error: any) {
      console.error('Error deleting bus:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  const viewSeatConfiguration = (bus: BusData) => {
    setEditingBus(bus);
    setShowSeatModal(true);
  };

  const openCreateModal = () => {
    setEditingBus(null);
    setFormData({
      bus_name: '',
      internal_number: '',
      registration: '',
      brand: '',
      year: new Date().getFullYear(),
      type: 'standard',
      total_seats: 50,
      state: 'actif',
      maintenance_note: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBus(null);
  };

  const closeSeatModal = () => {
    setShowSeatModal(false);
    setEditingBus(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-color2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de la Flotte</h2>
          <p className="text-sm text-gray-600 mt-1">Gérez vos bus et leur configuration</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
        >
          <Plus size={20} weight="bold" />
          Ajouter un bus
        </button>
      </div>

      {/* Buses List */}
      {buses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BusIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Aucun bus enregistré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BusIcon size={32} className="text-color2" weight="duotone" />
                  <div>
                    <h3 className="font-bold text-gray-900">{bus.bus_name}</h3>
                    <p className="text-xs text-gray-500">{bus.registration}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bus.state === 'actif'
                      ? 'bg-green-100 text-green-800'
                      : bus.state === 'en_maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bus.state}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {bus.brand && <p>Marque: {bus.brand}</p>}
                {bus.year && <p>Année: {bus.year}</p>}
                <p>Type: {bus.type.toUpperCase()}</p>
                <p className="flex items-center gap-2">
                  <Armchair size={16} className="text-color2" />
                  {bus.total_seats} sièges
                </p>
                {bus.internal_number && <p className="text-xs">N° interne: {bus.internal_number}</p>}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => viewSeatConfiguration(bus)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                >
                  <Armchair size={16} />
                  {t('admin.buses.seats')}
                </button>
                <button
                  onClick={() => handleEdit(bus)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  <Pencil size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(bus)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  <Trash size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBus ? 'Modifier' : 'Ajouter'} un bus
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du bus *
                  </label>
                  <input
                    type="text"
                    value={formData.bus_name}
                    onChange={(e) => setFormData({ ...formData, bus_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    placeholder="Ex: VIP Express"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro interne
                  </label>
                  <input
                    type="text"
                    value={formData.internal_number}
                    onChange={(e) => setFormData({ ...formData, internal_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    placeholder="Ex: 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Immatriculation *
                  </label>
                  <input
                    type="text"
                    value={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    placeholder="Ex: AB-123-CD"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    placeholder="Ex: Mercedes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de sièges *
                  </label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'standard' | 'vip' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    required
                  >
                    <option value="standard">Standard</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  >
                    <option value="actif">Actif</option>
                    <option value="en_maintenance">En maintenance</option>
                    <option value="hors_service">Hors service</option>
                  </select>
                </div>
              </div>

              {formData.state === 'en_maintenance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note de maintenance
                  </label>
                  <textarea
                    value={formData.maintenance_note}
                    onChange={(e) => setFormData({ ...formData, maintenance_note: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                    rows={3}
                    placeholder="Ex: Révision annuelle du 10/12 au 15/12"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('admin.buses.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
                >
                  {editingBus ? 'Enregistrer' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Configuration Modal */}
      {showSeatModal && editingBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Configuration des sièges</h3>
                <p className="text-sm text-gray-600">{editingBus.bus_name} - {editingBus.total_seats} sièges</p>
              </div>
              <button onClick={closeSeatModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-800 text-white text-center py-3 rounded-t-xl mb-4">
                <p className="font-semibold">🚗 Avant du bus</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-xl">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Configuration 2+2 générée automatiquement
                </p>
                <p className="text-center text-xs text-gray-500">
                  L'édition avancée des sièges sera disponible prochainement
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusFleetManagement;
