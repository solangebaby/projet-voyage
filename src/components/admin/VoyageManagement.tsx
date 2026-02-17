import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../ConfirmDialog';
import { Calendar, Plus, Check, X, Eye, ArrowRight, Bus as BusIcon, PencilSimple, Trash } from '@phosphor-icons/react';
import { t } from 'i18next';

interface Voyage {
  id: number;
  departure: { city_name: string };
  destination: { city_name: string };
  bus: { bus_name: string; total_seats: number };
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: string;
}

const VoyageManagement = () => {
  const { confirm } = useConfirm();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    departure_id: '',
    destination_id: '',
    departure_agency_id: '',
    arrival_agency_id: '',
    bus_id: '',
    departure_date: '',
    departure_time: '',
    price: '',
    duration: '04:00',
    distance_km: '',
    status: 'active',
  });
  const [departureAgencies, setDepartureAgencies] = useState<any[]>([]);
  const [arrivalAgencies, setArrivalAgencies] = useState<any[]>([]);
  const [editingVoyage, setEditingVoyage] = useState<any>(null);
  const [calculatedArrival, setCalculatedArrival] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchVoyages();
    fetchCities();
    fetchRoutes();
    fetchBuses();
  }, []);

  // Fetch agencies when departure city changes
  useEffect(() => {
    if (formData.departure_id) {
      fetchDepartureAgencies(formData.departure_id);
    } else {
      setDepartureAgencies([]);
    }
  }, [formData.departure_id]);

  // Fetch agencies when arrival city changes
  useEffect(() => {
    if (formData.destination_id) {
      fetchArrivalAgencies(formData.destination_id);
    } else {
      setArrivalAgencies([]);
    }
  }, [formData.destination_id]);

  const fetchDepartureAgencies = async (cityId: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/agencies?destination_id=${cityId}`);
      if (response.data.success) {
        setDepartureAgencies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departure agencies:', error);
    }
  };

  const fetchArrivalAgencies = async (cityId: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/agencies?destination_id=${cityId}`);
      if (response.data.success) {
        setArrivalAgencies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching arrival agencies:', error);
    }
  };

  useEffect(() => {
    if (formData.departure_time && formData.duration) {
      calculateArrivalTime();
    }
  }, [formData.departure_time, formData.duration]);

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/voyages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setVoyages(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur chargement voyages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {}
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/routes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (error) {}
  };

  const fetchBuses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/fleet/buses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBuses(response.data.data.filter((b: any) => b.state === 'actif'));
      }
    } catch (error) {}
  };

  const calculateArrivalTime = () => {
    const [hours, minutes] = formData.departure_time.split(':').map(Number);
    const [durHours, durMinutes] = formData.duration.split(':').map(Number);
    
    const totalMinutes = (hours * 60 + minutes) + (durHours * 60 + durMinutes);
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    
    setCalculatedArrival(`${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté frontend
    if (!formData.departure_id) {
      toast.error('Veuillez sélectionner une ville de départ');
      return;
    }
    if (!formData.destination_id) {
      toast.error('Veuillez sélectionner une ville d\'arrivée');
      return;
    }
    if (formData.departure_id === formData.destination_id) {
      toast.error('La ville de départ et d\'arrivée doivent être différentes');
      return;
    }
    if (!formData.bus_id) {
      toast.error('Veuillez sélectionner un bus');
      return;
    }
    if (!formData.departure_date) {
      toast.error('Veuillez sélectionner une date');
      return;
    }
    if (!formData.departure_time) {
      toast.error('Veuillez entrer l\'heure de départ');
      return;
    }
    if (!formData.duration) {
      toast.error('Veuillez entrer la durée du trajet');
      return;
    }
    // Validation format durée HH:MM
    const durationPattern = /^[0-9]{1,2}:[0-5][0-9]$/;
    if (!durationPattern.test(formData.duration)) {
      toast.error('Format durée invalide. Utilisez HH:MM (ex: 05:30)');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Veuillez entrer un prix positif');
      return;
    }

    try {
      // Préparer les données avec les bons noms de champs
      const payload = {
        departure_id: formData.departure_id,
        destination_id: formData.destination_id,
        departure_agency_id: formData.departure_agency_id || null,
        arrival_agency_id: formData.arrival_agency_id || null,
        bus_id: formData.bus_id,
        departure_date: formData.departure_date,
        departure_time: formData.departure_time,
        duration: formData.duration,
        distance_km: formData.distance_km || 0,
        price: formData.price || 0,
        status: formData.status,
      };

      let response;
      if (editingVoyage) {
        // Mode édition
        response = await axios.put(
          `http://localhost:8000/api/voyages/${editingVoyage.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Mode création
        response = await axios.post(
          'http://localhost:8000/api/voyages',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      if (response.data.success) {
        toast.success(response.data.message, { duration: 3000 });
        fetchVoyages();
        closeModal();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la création du voyage';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        // Afficher chaque erreur de validation
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err, { duration: 4000 });
        });
      } else {
        toast.error(message, { duration: 4000 });
      }
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/voyages/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchVoyages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur activation');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/voyages/${id}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchVoyages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur désactivation');
    }
  };

  const openModal = (voyage?: any) => {
    if (voyage) {
      // Mode édition
      setEditingVoyage(voyage);
      setFormData({
        departure_id: voyage.departure_id?.toString() || voyage.departure?.id?.toString() || '',
        destination_id: voyage.destination_id?.toString() || voyage.destination?.id?.toString() || '',
        bus_id: voyage.bus_id?.toString() || voyage.bus?.id?.toString() || '',
        departure_date: voyage.departure_date || '',
        departure_agency_id: voyage.departure_agency_id || '',
        arrival_agency_id: voyage.arrival_agency_id || '',
        distance_km: voyage.distance_km || '',
        departure_time: voyage.departure_time || '',
        duration: '04:00',
        price: '0',
        status: voyage.status || 'active',
      });
    } else {
      // Mode création
      setEditingVoyage(null);
      setFormData({
        departure_id: '',
        destination_id: '',
        departure_agency_id: '',
        arrival_agency_id: '',
        bus_id: '',
        departure_date: '',
        departure_time: '',
        duration: '04:00',
        price: '',
        distance_km: '',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVoyage(null);
    setFormData({
      departure_id: '',
      destination_id: '',
      departure_agency_id: '',
      arrival_agency_id: '',
      bus_id: '',
      departure_date: '',
      departure_time: '',
      price: '',
      duration: '04:00',
      distance_km: '',
      status: 'active',
    });
    setCalculatedArrival('');
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('Êtes-vous sûr de vouloir supprimer ce voyage ?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/voyages/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Voyage supprimé avec succès');
        fetchVoyages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-color2"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Planification des Voyages</h2>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-primary hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Plus size={20} weight="bold" />
            Créer un voyage
          </button>
        </div>

        {/* Voyages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voyages.map((voyage) => (
            <div key={voyage.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-gray-900">{voyage.departure.city_name}</span>
                <ArrowRight className="text-color2" weight="bold" />
                <span className="font-bold text-gray-900">{voyage.destination.city_name}</span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><Calendar size={16} className="inline text-color2 mr-1" />{voyage.departure_date}</p>
                <p><BusIcon size={16} className="inline text-color2 mr-1" />{voyage.bus.bus_name}</p>
                <p>{voyage.departure_time} → {voyage.arrival_time}</p>
                <p className="font-bold text-green-600">{voyage.price} FCFA</p>
                <p className="text-xs">{voyage.available_seats} sièges</p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  voyage.status === 'active' ? 'bg-success-100 text-success-800' :
                  voyage.status === 'cancelled' ? 'bg-danger-100 text-danger-800' :
                  'bg-neutral-100 text-neutral-800'
                }`}>
                  {voyage.status === 'active' ? 'Actif' : voyage.status === 'cancelled' ? 'Annulé' : voyage.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal(voyage)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition text-sm"
                  title="Modifier"
                >
                  <PencilSimple size={16} weight="bold" />
                  Modifier
                </button>
                
                <button
                  onClick={() => handleDelete(voyage.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition text-sm"
                  title="Supprimer"
                >
                  <Trash size={16} weight="bold" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-dark">
                  {editingVoyage ? 'Modifier le voyage' : 'Créer un voyage'}
                </h3>
                <button onClick={closeModal}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Sélecteur de Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut du voyage *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="active">🟢 Actif (En vente)</option>
                    <option value="cancelled">🔴 Inactif (Annulé)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Actif = visible pour les clients | Inactif = masqué
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={formData.departure_id}
                    onChange={(e) => setFormData({ ...formData, departure_id: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Ville départ *</option>
                    {cities.map((c) => (<option key={c.id} value={c.id}>{c.city_name}</option>))}
                  </select>

                  <select
                    value={formData.destination_id}
                    onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Ville arrivée *</option>
                    {cities.filter(c => c.id.toString() !== formData.departure_id).map((c) => (
                      <option key={c.id} value={c.id}>{c.city_name}</option>
                    ))}
                  </select>

                  {/* Agence de départ */}
                  {formData.departure_id && departureAgencies.length > 0 && (
                    <select
                      value={formData.departure_agency_id}
                      onChange={(e) => setFormData({ ...formData, departure_agency_id: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="">Agence de départ (optionnel)</option>
                      {departureAgencies.map((a) => (
                        <option key={a.id} value={a.id}>{a.agency_name}</option>
                      ))}
                    </select>
                  )}

                  {/* Agence d'arrivée */}
                  {formData.destination_id && arrivalAgencies.length > 0 && (
                    <select
                      value={formData.arrival_agency_id}
                      onChange={(e) => setFormData({ ...formData, arrival_agency_id: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="">Agence d'arrivée (optionnel)</option>
                      {arrivalAgencies.map((a) => (
                        <option key={a.id} value={a.id}>{a.agency_name}</option>
                      ))}
                    </select>
                  )}

                  <select
                    value={formData.bus_id}
                    onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Bus *</option>
                    {buses.map((b) => (<option key={b.id} value={b.id}>{b.bus_name} ({b.total_seats} sièges)</option>))}
                  </select>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date du voyage *
                    </label>
                    <input
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <input
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée du trajet *
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Ex: 04:30"
                      pattern="[0-9]{1,2}:[0-5][0-9]"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: HH:MM (heures:minutes)
                    </p>
                  </div>

                  {calculatedArrival && (
                    <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-gray-600">Heure d'arrivée calculée:</p>
                      <p className="font-bold text-green-700">{calculatedArrival}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.voyages.priceFCFA')} *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Ex: 2500"
                      min="0"
                      step="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.voyages.positivePriceFCFA')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border rounded-lg">
                    {t('admin.voyages.cancel')}
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-primary transition">
                    {editingVoyage ? 'Mettre à jour' : 'Créer le voyage'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoyageManagement;

