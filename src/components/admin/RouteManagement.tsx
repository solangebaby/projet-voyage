import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MapTrifold,
  Plus,
  Pencil,
  Trash,
  X,
  ArrowRight,
  Clock,
  Path
} from '@phosphor-icons/react';

interface City {
  id: number;
  city_name: string;
}

interface Route {
  id: number;
  departure_id: number;
  destination_id: number;
  distance: number;
  duration: string;
  departure: City;
  destination: City;
  route_name?: string;
  status: string;
}

const RouteManagement = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    departure_id: '',
    destination_id: '',
    distance: '',
    duration: ''
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRoutes();
    fetchCities();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/routes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching routes:', error);
      toast.error('Erreur lors du chargement des trajets');
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
        setCities(response.data.data.filter((c: any) => c.status === 'actif'));
      }
    } catch (error: any) {
      console.error('Error fetching cities:', error);
    }
  };

  const validateDistance = (distance: string): boolean => {
    const num = parseFloat(distance);
    if (isNaN(num) || num <= 0) {
      toast.error('Veuillez entrer une distance valide');
      return false;
    }
    return true;
  };

  const validateDuration = (duration: string): boolean => {
    const regex = /^([0-9]{1,2}):([0-5][0-9])$/;
    if (!regex.test(duration)) {
      toast.error('Durée estimée non valide (format: HH:MM)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.departure_id || !formData.destination_id) {
      toast.error('Veuillez sélectionner les villes de départ et d\'arrivée');
      return;
    }

    if (formData.departure_id === formData.destination_id) {
      toast.error('La ville de départ et d\'arrivée ne peuvent pas être identiques');
      return;
    }

    if (!validateDistance(formData.distance)) {
      return;
    }

    if (!validateDuration(formData.duration)) {
      return;
    }

    try {
      if (editingRoute) {
        // Update route
        const response = await axios.put(
          `http://localhost:8000/api/routes/${editingRoute.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          toast.success(response.data.message);
          if (response.data.warning) {
            toast(response.data.warning, { icon: '⚠️', duration: 5000 });
          }
          fetchRoutes();
          closeModal();
        }
      } else {
        // Create route
        const response = await axios.post(
          'http://localhost:8000/api/routes',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          toast.success(response.data.message);
          fetchRoutes();
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('Error saving route:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(message);
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      departure_id: route.departure_id.toString(),
      destination_id: route.destination_id.toString(),
      distance: route.distance.toString(),
      duration: route.duration
    });
    setShowModal(true);
  };

  const handleDelete = async (route: Route) => {
    const routeName = `${route.departure.city_name} → ${route.destination.city_name}`;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le trajet ${routeName} ?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/routes/${route.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchRoutes();
      }
    } catch (error: any) {
      console.error('Error deleting route:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  const openCreateModal = () => {
    setEditingRoute(null);
    setFormData({
      departure_id: '',
      destination_id: '',
      distance: '',
      duration: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoute(null);
    setFormData({
      departure_id: '',
      destination_id: '',
      distance: '',
      duration: ''
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Trajets</h2>
          <p className="text-sm text-gray-600 mt-1">Gérez les trajets entre villes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
        >
          <Plus size={20} weight="bold" />
          Créer un trajet
        </button>
      </div>

      {/* Routes List */}
      {routes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <MapTrifold size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Aucun trajet enregistré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span>{route.departure.city_name}</span>
                  <ArrowRight size={20} className="text-color2" weight="bold" />
                  <span>{route.destination.city_name}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Path size={18} className="text-color2" />
                  <span>Distance: {route.distance} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-color2" />
                  <span>Durée: {route.duration}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(route)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <Pencil size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(route)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <Trash size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRoute ? 'Modifier' : 'Créer'} un trajet
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville de départ *
                </label>
                <select
                  value={formData.departure_id}
                  onChange={(e) => setFormData({ ...formData, departure_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville d'arrivée *
                </label>
                <select
                  value={formData.destination_id}
                  onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {cities
                    .filter((city) => city.id.toString() !== formData.departure_id)
                    .map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.city_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  placeholder="Ex: 250"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée estimée (HH:MM) *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  placeholder="Ex: 04:30"
                  pattern="[0-9]{1,2}:[0-5][0-9]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: heures:minutes (ex: 04:30)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
                >
                  {editingRoute ? 'Enregistrer' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
