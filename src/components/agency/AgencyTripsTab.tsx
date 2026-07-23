import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAgencyTrips,
  getBuses,
  createTrip,
  cancelTrip,
  getDestinations,
} from '../../services/api';

interface Trip {
  id: number;
  departure?: { city_name: string };
  destination?: { city_name: string };
  departure_date?: string;
  departure_time?: string;
  arrival_time?: string;
  price?: number;
  validation_status?: string;
  status?: string;
  bus?: { bus_name: string; total_seats: number };
  departureAgency?: { agency_name: string };
}

interface Bus {
  id: number;
  bus_name: string;
  total_seats: number;
  type?: string;
}

interface Destination {
  id: number;
  city_name: string;
  region?: string;
}

interface FormData {
  departure_id: string;
  destination_id: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  price: string;
  bus_id: string;
  distance_km: string;
}

const AVERAGE_SPEED_KMH = 80;

const computeArrivalTime = (departureTime: string, distanceKm: number): string => {
  if (!departureTime || !distanceKm || distanceKm <= 0) return '';
  const durationMinutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
  const [h, m] = departureTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  const arrH = Math.floor(total / 60) % 24;
  const arrM = total % 60;
  return `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
};

const formatDuration = (distanceKm: number): string => {
  const totalMin = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
};

const getStatusConfig = (status?: string) => {
  switch (status) {
    case 'draft':              return { label: 'Brouillon',  color: 'bg-gray-100 text-gray-600' };
    case 'pending_validation': return { label: 'En attente', color: 'bg-amber-100 text-amber-700' };
    case 'active':             return { label: 'Approuvé',   color: 'bg-green-100 text-green-700' };
    case 'rejected':           return { label: 'Rejeté',     color: 'bg-red-100 text-red-700' };
    case 'cancelled':          return { label: 'Annulé',     color: 'bg-gray-100 text-gray-400' };
    default:                   return { label: status || '—', color: 'bg-blue-100 text-blue-700' };
  }
};

export default function AgencyTripsTab() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emptyForm: FormData = {
    departure_id: '', destination_id: '', departure_date: '',
    departure_time: '', arrival_time: '', price: '', bus_id: '', distance_km: '',
  };
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripsRes, busesRes, destRes] = await Promise.all([
        getAgencyTrips(),
        getBuses(),
        getDestinations(),
      ]);
      setTrips(tripsRes?.data?.data || tripsRes?.data || tripsRes || []);
      setBuses(busesRes?.data || busesRes || []);
      setDestinations(destRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const updated = { ...formData, [field]: value };
    if (field === 'departure_time' || field === 'distance_km') {
      const time = field === 'departure_time' ? value : formData.departure_time;
      const dist = field === 'distance_km' ? Number(value) : Number(formData.distance_km);
      updated.arrival_time = computeArrivalTime(time, dist);
    }
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.arrival_time) {
      setError("Renseignez la distance pour calculer l'heure d'arrivée."); return;
    }
    if (formData.departure_id === formData.destination_id) {
      setError("Le départ et l'arrivée doivent être différents."); return;
    }
    setSubmitting(true);
    try {
      await createTrip({
        departure_id:          Number(formData.departure_id),
        destination_id:        Number(formData.destination_id),
        departure_date:        formData.departure_date,
        departure_time:        formData.departure_time,
        arrival_time:          formData.arrival_time,
        price:                 Number(formData.price),
        bus_id:                Number(formData.bus_id),
        distance_km:           Number(formData.distance_km),
        submit_for_validation: true,
      });
      setSuccess('Voyage créé et soumis pour validation !');
      setShowModal(false);
      setFormData(emptyForm);
      fetchAll();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      setError(apiErrors
        ? Object.values(apiErrors).flat().join(' — ')
        : err?.response?.data?.message || 'Erreur création voyage.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (tripId: number) => {
    if (!window.confirm('Annuler ce trajet ?')) return;
    try { await cancelTrip(tripId); fetchAll(); }
    catch (err: any) { alert(err?.response?.data?.message || 'Impossible d\'annuler.'); }
  };

  const destinationsFiltered = destinations.filter(
    (d) => String(d.id) !== formData.departure_id
  );

  return (
    <div className="space-y-4">
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">✕</button>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => { setShowModal(true); setError(null); }}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + Nouveau Voyage
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Chargement...</div>
        ) : trips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Départ','Arrivée','Agence','Date','Horaires','Bus','Prix','Statut','Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.map((trip) => {
                  const { label, color } = getStatusConfig(trip.validation_status);
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-semibold">{trip.departure?.city_name || '—'}</td>
                      <td className="px-4 py-4 text-sm font-semibold">{trip.destination?.city_name || '—'}</td>
                      <td className="px-4 py-4 text-sm text-blue-700 font-medium">{trip.departureAgency?.agency_name || '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {trip.departure_date
                          ? new Date(trip.departure_date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-gray-600">
                        {trip.departure_time?.slice(0,5) || '—'}
                        {trip.arrival_time ? ` → ${trip.arrival_time.slice(0,5)}` : ''}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{trip.bus?.bus_name || '—'}</td>
                      <td className="px-4 py-4 text-sm font-semibold">
                        {trip.price ? `${Number(trip.price).toLocaleString('fr-FR')} XAF` : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {(trip.validation_status === 'draft' || trip.validation_status === 'rejected') && (
                          <button onClick={() => handleCancel(trip.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium">
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-sm">Aucun voyage créé pour le moment.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nouveau Voyage</h2>
                <p className="text-xs text-gray-400 mt-0.5">Soumis à validation après création.</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormData(emptyForm); setError(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Départ *</label>
                  <select value={formData.departure_id}
                    onChange={(e) => handleFieldChange('departure_id', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required>
                    <option value="">Sélectionner</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.city_name}{d.region ? ` · ${d.region}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Arrivée *</label>
                  <select value={formData.destination_id}
                    onChange={(e) => handleFieldChange('destination_id', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required disabled={!formData.departure_id}>
                    <option value="">Sélectionner</option>
                    {destinationsFiltered.map(d => (
                      <option key={d.id} value={d.id}>{d.city_name}{d.region ? ` · ${d.region}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Date de départ *</label>
                <input type="date" value={formData.departure_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleFieldChange('departure_date', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Heure départ *</label>
                  <input type="time" value={formData.departure_time}
                    onChange={(e) => handleFieldChange('departure_time', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Distance (km) *</label>
                  <input type="number" placeholder="Ex: 350" value={formData.distance_km} min={1}
                    onChange={(e) => handleFieldChange('distance_km', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
              </div>

              {formData.arrival_time ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Heure d'arrivée estimée</p>
                    <p className="text-blue-800 font-black text-lg">
                      {formData.arrival_time}
                      <span className="text-xs font-normal text-blue-400 ml-2">
                        — {formatDuration(Number(formData.distance_km))} à {AVERAGE_SPEED_KMH} km/h
                      </span>
                    </p>
                  </div>
                </div>
              ) : formData.departure_time && !formData.distance_km ? (
                <p className="text-xs text-gray-400 italic">Renseignez la distance pour calculer l'heure d'arrivée.</p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Prix (XAF) *</label>
                  <input type="number" placeholder="Ex: 5000" value={formData.price} min={0}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Bus *</label>
                  <select value={formData.bus_id}
                    onChange={(e) => handleFieldChange('bus_id', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required>
                    <option value="">Sélectionner</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>
                        {bus.bus_name} ({bus.total_seats} pl.{bus.type ? ` · ${bus.type}` : ''})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.departure_id && formData.destination_id && formData.arrival_time && formData.price && formData.bus_id && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-1.5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Récapitulatif</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trajet</span>
                    <span className="font-semibold">
                      {destinations.find(d => String(d.id) === formData.departure_id)?.city_name}
                      {' → '}
                      {destinations.find(d => String(d.id) === formData.destination_id)?.city_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Horaire</span>
                    <span className="font-mono font-semibold">{formData.departure_time} → {formData.arrival_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Distance</span>
                    <span className="font-semibold">{formData.distance_km} km</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 mt-1">
                    <span className="text-gray-500">Prix</span>
                    <span className="font-bold text-blue-700">{Number(formData.price).toLocaleString('fr-FR')} XAF</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowModal(false); setFormData(emptyForm); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold flex items-center justify-center gap-2">
                  {submitting ? 'Création...' : '✓ Créer & Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}