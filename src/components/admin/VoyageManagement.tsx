import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Plus, Check, X, Eye, ArrowRight, Bus as BusIcon } from '@phosphor-icons/react';

interface Voyage {
  id: number;
  departure: { city_name: string };
  destination: { city_name: string };
  bus: { bus_name: string; total_seats: number };
  trip_date: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: string;
}

const VoyageManagement = () => {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    departure_id: '',
    destination_id: '',
    bus_id: '',
    trip_date: '',
    departure_time: '',
    price: '',
    duration: '04:00'
  });
  const [calculatedArrival, setCalculatedArrival] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchVoyages();
    fetchCities();
    fetchRoutes();
    fetchBuses();
  }, []);

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

    try {
      const response = await axios.post(
        'http://localhost:8000/api/voyages',
        { ...formData, arrival_time: calculatedArrival },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message, { duration: 5000 });
        fetchVoyages();
        closeModal();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur création voyage');
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

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      departure_id: '',
      destination_id: '',
      bus_id: '',
      trip_date: '',
      departure_time: '',
      price: '',
      duration: '04:00'
    });
    setCalculatedArrival('');
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3"
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
                <p><Calendar size={16} className="inline text-color2 mr-1" />{voyage.trip_date}</p>
                <p><BusIcon size={16} className="inline text-color2 mr-1" />{voyage.bus.bus_name}</p>
                <p>{voyage.departure_time} → {voyage.arrival_time}</p>
                <p className="font-bold text-green-600">{voyage.price} FCFA</p>
                <p className="text-xs">{voyage.available_seats} sièges</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                voyage.status === 'active' ? 'bg-green-100 text-green-800' :
                voyage.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {voyage.status}
              </span>

              {voyage.status === 'draft' && (
                <button
                  onClick={() => handleActivate(voyage.id)}
                  className="w-full mt-3 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  <Check size={16} className="inline mr-1" />
                  Activer la vente
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold">Créer un voyage</h3>
                <button onClick={closeModal}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                  <select
                    value={formData.bus_id}
                    onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Bus *</option>
                    {buses.map((b) => (<option key={b.id} value={b.id}>{b.bus_name} ({b.total_seats} sièges)</option>))}
                  </select>

                  <input
                    type="date"
                    value={formData.trip_date}
                    onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />

                  <input
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Durée (HH:MM)"
                    className="px-4 py-2 border rounded-lg"
                  />

                  {calculatedArrival && (
                    <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-gray-600">Heure d'arrivée calculée:</p>
                      <p className="font-bold text-green-700">{calculatedArrival}</p>
                    </div>
                  )}

                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Prix (FCFA) *"
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border rounded-lg">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-color2 text-white rounded-lg">
                    Créer le voyage
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
