import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MapPin,
  Plus,
  Pencil,
  Trash,
  X,
  Check,
  Warning
} from '@phosphor-icons/react';

interface City {
  id: number;
  city_name: string;
  region: string | null;
  country: string;
  status: 'actif' | 'inactif';
  created_at: string;
}

const CityManagement = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({
    city_name: '',
    region: '',
    country: 'Cameroun',
    status: 'actif' as 'actif' | 'inactif'
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/cities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      toast.error('Erreur lors du chargement des villes');
    } finally {
      setLoading(false);
    }
  };

  const validateAlphabetic = (value: string, fieldName: string): boolean => {
    const regex = /^[a-zA-ZÀ-ÿ\s\-']+$/u;
    if (!regex.test(value)) {
      if (fieldName === 'city_name') {
        toast.error('Entrez un nom valide');
      } else if (fieldName === 'region') {
        toast.error('Veuillez entrer un nom de région valide');
      } else if (fieldName === 'country') {
        toast.error('Veuillez entrer un nom de pays valide');
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate city name
    if (!formData.city_name.trim()) {
      toast.error('Le nom de la ville est requis');
      return;
    }

    if (!validateAlphabetic(formData.city_name, 'city_name')) {
      return;
    }

    // Validate region if provided
    if (formData.region && !validateAlphabetic(formData.region, 'region')) {
      return;
    }

    // Validate country if provided
    if (formData.country && !validateAlphabetic(formData.country, 'country')) {
      return;
    }

    try {
      if (editingCity) {
        // Update city
        const response = await axios.put(
          `http://localhost:8000/api/cities/${editingCity.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          toast.success(response.data.message);
          if (response.data.warning) {
            toast(response.data.warning, { icon: '⚠️', duration: 5000 });
          }
          fetchCities();
          closeModal();
        }
      } else {
        // Create city
        const response = await axios.post(
          'http://localhost:8000/api/cities',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          toast.success(response.data.message);
          fetchCities();
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('Error saving city:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(message);
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      city_name: city.city_name,
      region: city.region || '',
      country: city.country,
      status: city.status
    });
    setShowModal(true);
  };

  const handleDelete = async (city: City) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette ville ?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/cities/${city.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCities();
      }
    } catch (error: any) {
      console.error('Error deleting city:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  const openCreateModal = () => {
    setEditingCity(null);
    setFormData({
      city_name: '',
      region: '',
      country: 'Cameroun',
      status: 'actif'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCity(null);
    setFormData({
      city_name: '',
      region: '',
      country: 'Cameroun',
      status: 'actif'
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
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Villes</h2>
          <p className="text-sm text-gray-600 mt-1">Gérez les villes pour les trajets</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
        >
          <Plus size={20} weight="bold" />
          Ajouter une ville
        </button>
      </div>

      {/* Cities List */}
      {cities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Aucune ville enregistrée</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin size={20} className="text-color2 mr-2" weight="duotone" />
                      <span className="font-medium text-gray-900">{city.city_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {city.region || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {city.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        city.status === 'actif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {city.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(city)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(city)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCity ? 'Modifier' : 'Ajouter'} une ville
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la ville *
                </label>
                <input
                  type="text"
                  value={formData.city_name}
                  onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  placeholder="Ex: Douala"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  placeholder="Ex: Littoral"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  placeholder="Ex: Cameroun"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="actif"
                      checked={formData.status === 'actif'}
                      onChange={(e) => setFormData({ ...formData, status: 'actif' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Actif</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="inactif"
                      checked={formData.status === 'inactif'}
                      onChange={(e) => setFormData({ ...formData, status: 'inactif' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Inactif</span>
                  </label>
                </div>
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
                  {editingCity ? 'Mettre à jour' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityManagement;
