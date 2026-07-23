import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAgencyTrips, getTripPassengers } from '../../services/api';

interface Trip {
  id: number;
  departure?: { city_name: string };
  destination?: { city_name: string };
  departure_date?: string;
  departure_time?: string;
  bus?: { bus_name: string };
}

interface Passenger {
  id: number;
  passenger_first_name?: string;
  passenger_last_name?: string;
  passenger_cni?: string;
  selected_seat?: string;
  status?: string;
  counter_status?: string;
  ticket?: { ticket_number: string };
}

export default function AgencyPassengersTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchPassengers(selectedTripId);
    }
  }, [selectedTripId]);

  const fetchTrips = async () => {
    try {
      const data = await getAgencyTrips();
      const tripsData = data.data || data || [];
      setTrips(tripsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  const fetchPassengers = async (tripId: number) => {
    try {
      const data = await getTripPassengers(tripId);
      setPassengers(data.data || data || []);
      const trip = trips.find((t) => t.id === tripId);
      if (trip) {
        setSelectedTrip(trip);
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const filteredTrips = filterDate
    ? trips.filter((trip) => trip.departure_date === filterDate)
    : trips;

  const getCounterStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'reserved_at_counter':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleValidateTicket = (passengerId: number) => {
    console.log('Validating ticket for passenger:', passengerId);
    // This would call an API endpoint to update counter_status
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {filterDate && (
            <div className="flex items-end">
              <button
                onClick={() => setFilterDate('')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trip Selection */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Sélectionner un trajet</h3>
        {loading ? (
          <p className="text-gray-500">{t('common.loading')}</p>
        ) : filteredTrips.length > 0 ? (
          <div className="space-y-2">
            {filteredTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelectedTripId(trip.id)}
                className={`w-full text-left p-4 border rounded-lg transition-all ${
                  selectedTripId === trip.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {trip.departure?.city_name} → {trip.destination?.city_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {trip.departure_date} à {trip.departure_time}
                    </p>
                    <p className="text-sm text-gray-600">{trip.bus?.bus_name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun trajet disponible</p>
        )}
      </div>

      {/* Passengers Table */}
      {selectedTripId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Passagers - {selectedTrip?.departure?.city_name} → {selectedTrip?.destination?.city_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedTrip?.departure_date} à {selectedTrip?.departure_time}
            </p>
          </div>

          {passengers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siège</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut Rés.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Embarquement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {passengers.map((passenger) => (
                    <tr key={passenger.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {passenger.passenger_last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{passenger.passenger_first_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{passenger.passenger_cni}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{passenger.selected_seat}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReservationStatusColor(passenger.status || '')}`}>
                          {passenger.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCounterStatusColor(passenger.counter_status || 'pending')}`}>
                          {passenger.counter_status || 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {passenger.ticket?.ticket_number ? (
                          <span className="font-mono text-xs">{passenger.ticket.ticket_number}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {passenger.counter_status !== 'validated' && (
                          <button
                            onClick={() => handleValidateTicket(passenger.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Valider
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/scan-ticket')}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Scanner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">Aucun passager pour ce trajet</div>
          )}
        </div>
      )}
    </div>
  );
}
