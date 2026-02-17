import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Bus, 
  CurrencyDollar, 
  Users,
  ArrowRight,
  Buildings,
  Ticket
} from "@phosphor-icons/react";

const TicketsImproved = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const { 
    departure_city, 
    arrival_city, 
    trip_date,
    departure_agency,
    arrival_agency 
  } = location.state || {};

  useEffect(() => {
    if (!departure_city || !arrival_city || !trip_date) {
      toast.error("Veuillez sélectionner une ville de départ et d'arrivée");
      navigate("/");
      return;
    }
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/trips/available", {
        params: {
          departure_id: departure_city?.id,
          destination_id: arrival_city?.id,
          date: trip_date,
        },
      });

      if (response.data.success) {
        setTrips(response.data.data);
        if (response.data.data.length === 0) {
          toast("Aucun voyage disponible pour cette date", { icon: "ℹ️" });
        }
      }
    } catch (error: any) {
      console.error("Error fetching trips:", error);
      toast.error("Erreur lors du chargement des voyages");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (trip: any) => {
    navigate("/confirmation", {
      state: {
        trip,
        departure_city,
        arrival_city,
        departure_agency,
        arrival_agency,
      },
    });
  };

  const formatTime = (time: string) => {
    return time?.substring(0, 5) || "N/A";
  };

  const getAvailableSeats = (trip: any) => {
    const totalSeats = trip.bus?.total_seats || 0;
    const occupiedSeats = trip.occupied_seats ? JSON.parse(trip.occupied_seats).length : 0;
    return totalSeats - occupiedSeats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-dark text-lg font-medium">Recherche des voyages disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header avec informations de recherche */}
      <div className="bg-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Voyages Disponibles</h1>
              <p className="text-neutral-300">Sélectionnez votre voyage idéal</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              Modifier la recherche
            </button>
          </div>

          {/* Résumé de la recherche */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <MapPin size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-300">Départ</p>
                  <p className="font-semibold">{departure_city?.city_name}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <MapPin size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-300">Arrivée</p>
                  <p className="font-semibold">{arrival_city?.city_name}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue rounded-lg">
                  <Calendar size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-300">Date</p>
                  <p className="font-semibold">
                    {new Date(trip_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Ticket size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-300">Voyages trouvés</p>
                  <p className="font-semibold">{trips.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des voyages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <Bus size={80} className="text-neutral-300 mx-auto mb-4" weight="duotone" />
            <h3 className="text-2xl font-bold text-dark mb-2">Aucun voyage disponible</h3>
            <p className="text-neutral-500 mb-6">
              Aucun voyage n'est disponible pour cette date. Essayez une autre date ou un autre itinéraire.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold"
            >
              Nouvelle recherche
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => {
              const availableSeats = getAvailableSeats(trip);
              const isAlmostFull = availableSeats < 10;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden border border-neutral-100"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Horaires et itinéraire */}
                      <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-3xl font-bold text-dark">
                                  {formatTime(trip.departure_time)}
                                </p>
                                <p className="text-sm text-neutral-500 mt-1">{departure_city?.city_name}</p>
                                {departure_agency && (
                                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                                    <Buildings size={12} />
                                    {departure_agency.agency_name}
                                  </p>
                                )}
                              </div>

                              <div className="flex-1 px-4">
                                <div className="relative">
                                  <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full"></div>
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-white p-2 rounded-full shadow-soft">
                                      <Bus size={20} className="text-primary" weight="duotone" />
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-center text-neutral-500 mt-2">
                                  Durée estimée
                                </p>
                              </div>

                              <div className="text-center">
                                <p className="text-3xl font-bold text-dark">
                                  {formatTime(trip.arrival_time)}
                                </p>
                                <p className="text-sm text-neutral-500 mt-1">{arrival_city?.city_name}</p>
                                {arrival_agency && (
                                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                                    <Buildings size={12} />
                                    {arrival_agency.agency_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Informations du bus */}
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg">
                            <Bus size={20} className="text-primary" weight="duotone" />
                            <span className="text-sm font-medium text-dark">
                              {trip.bus?.bus_name || "Bus Standard"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                            <Users size={20} className="text-blue" weight="duotone" />
                            <span className="text-sm font-medium text-dark">
                              {availableSeats} sièges disponibles
                            </span>
                          </div>

                          {trip.bus?.type && (
                            <div className="px-3 py-2 bg-secondary-50 rounded-lg">
                              <span className="text-sm font-medium text-secondary capitalize">
                                {trip.bus.type === "vip" ? "VIP" : "Standard"}
                              </span>
                            </div>
                          )}

                          {isAlmostFull && (
                            <div className="px-3 py-2 bg-warning-50 rounded-lg">
                              <span className="text-sm font-medium text-warning">
                                🔥 Presque complet !
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prix et action */}
                      <div className="lg:col-span-5 flex flex-col justify-between border-l border-neutral-100 pl-6">
                        <div>
                          <p className="text-sm text-neutral-500 mb-2">Prix du billet</p>
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-bold text-dark">
                              {trip.price?.toLocaleString() || "N/A"}
                            </span>
                            <span className="text-xl text-neutral-500">FCFA</span>
                          </div>
                          <p className="text-xs text-neutral-400">Par personne, taxes incluses</p>
                        </div>

                        <button
                          onClick={() => handleSelectTrip(trip)}
                          disabled={availableSeats === 0}
                          className={`
                            w-full mt-4 py-4 rounded-xl font-semibold flex items-center justify-center gap-2
                            transition-all duration-300 transform hover:scale-105
                            ${
                              availableSeats === 0
                                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-primary to-secondary text-white shadow-primary hover:shadow-strong"
                            }
                          `}
                        >
                          {availableSeats === 0 ? (
                            "Complet"
                          ) : (
                            <>
                              Sélectionner ce voyage
                              <ArrowRight size={20} weight="bold" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer avec date */}
                  <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar size={16} />
                        <span>
                          {new Date(trip.departure_date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-neutral-400">Voyage #{trip.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsImproved;
