import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Trip } from "../../services/api"
import { Bus, Clock, MapPin, Users, Star } from "@phosphor-icons/react"
import toast from "react-hot-toast"
import NavBar from "../organs/NavBar"
import Footer from "../organs/Footer"
import { t } from "i18next"

interface LocationState {
  trips: Trip[]
  departure: string
  destination: string
  date: string
}

const TicketDetails = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as LocationState
  const { trips, departure, destination, date } = state || {}

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Vérifier que nous avons les données nécessaires
    if (!trips || trips.length === 0) {
      toast.error("No trip data available. Please search again.")
      setTimeout(() => {
        navigate("/")
      }, 2000)
    }
  }, [trips, navigate])

  const handleSelectTrip = (trip: Trip) => {
    setLoading(true)
    
    // Vérifier la disponibilité des sièges
    if (trip.available_seats <= 0) {
      toast.error("This trip is fully booked. Please select another trip.")
      setLoading(false)
      return
    }

    toast.success("Trip selected! Redirecting to seat selection...")
    
    setTimeout(() => {
      navigate("/confirmation", {
        state: {
          trip,
          departure,
          destination,
          date
        }
      })
      setLoading(false)
    }, 800)
  }

  const formatTime = (time: string) => {
    if (!time) return "N/A"
    return time.substring(0, 5) // Format HH:MM
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen pt-20 bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-50 py-2">
        {/* Bus Animation */}
        <div className="relative overflow-hidden h-16 mb-4 bg-white/50">
          <div className="absolute top-1/2 -translate-y-1/2 animate-[slideInBus_4s_ease-in-out_infinite]">
            <svg width="80" height="50" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="15" width="80" height="30" rx="5" fill="#F97316" />
              <rect x="15" y="20" width="15" height="10" rx="2" fill="#E0F2FE" />
              <rect x="35" y="20" width="15" height="10" rx="2" fill="#E0F2FE" />
              <rect x="55" y="20" width="15" height="10" rx="2" fill="#E0F2FE" />
              <rect x="75" y="20" width="10" height="10" rx="2" fill="#E0F2FE" />
              <circle cx="25" cy="45" r="8" fill="#1F2937" />
              <circle cx="75" cy="45" r="8" fill="#1F2937" />
              <circle cx="25" cy="45" r="4" fill="#6B7280" />
              <circle cx="75" cy="45" r="4" fill="#6B7280" />
              <circle cx="88" cy="25" r="3" fill="#FDE047" />
            </svg>
          </div>
        </div>
        <style>{`
          @keyframes slideInBus {
            0% { left: -100px; }
            100% { left: calc(100% + 100px); }
          }
        `}</style>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-primary">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <Bus size={32} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold bg-primary text-primary">
                  Available Trips
                </h1>
                <p className="text-gray-600 text-sm mt-1">Choose the trip that suits you best</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg border border-primary">
                <MapPin size={20} weight="fill" className="text-primary" />
                <span className="font-bold text-gray-900">{departure}</span>
                <span className="text-lg">→</span>
                <span className="font-bold text-gray-900">{destination}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary-50 px-4 py-2 rounded-lg border border-secondary">
                <Clock size={20} weight="fill" className="text-secondary" />
                <span className="font-semibold text-gray-700">{new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="ml-auto bg-primary-50 px-4 py-2 rounded-lg border border-primary">
                <span className="text-sm font-semibold text-gray-600">Results: </span>
                <span className="text-lg font-semibold text-primary">{trips.length}</span>
                <span className="text-sm font-semibold text-gray-600"> trip{trips.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Trips List - Structure simplifiée type Trainline */}
          <div className="space-y-2">
            {trips.map((trip) => (
              <div 
                key={trip.id} 
                className="bg-white border-l-4 border-l-primary border-y border-r border-neutral-200 hover:border-primary hover:bg-neutral-50 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="p-3 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                    {/* Horaires - Style Trainline */}
                    <div className="flex items-center gap-3 w-full md:min-w-[250px]">
                      <div>
                        <p className="text-xl md:text-2xl font-bold text-dark">{formatTime(trip.departure_time)}</p>
                        <p className="text-xs text-neutral-600">{trip.departure.city_name}</p>
                        {trip.departureAgency && (
                          <p className="text-xs text-neutral-500">{trip.departureAgency.neighborhood}</p>
                        )}
                      </div>
                      <div className="flex-1 text-center px-2">
                        <div className="flex items-center gap-1 text-neutral-400">
                          <div className="h-px flex-1 bg-neutral-300"></div>
                          <Bus size={16} weight="fill" className="text-primary" />
                          <div className="h-px flex-1 bg-neutral-300"></div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{trip.duration || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-bold text-dark">{formatTime(trip.arrival_time)}</p>
                        <p className="text-xs text-neutral-600">{trip.destination.city_name}</p>
                        {trip.arrivalAgency && (
                          <p className="text-xs text-neutral-500">{trip.arrivalAgency.neighborhood}</p>
                        )}
                      </div>
                    </div>

                    {/* Info Bus - Compact */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <Bus size={18} weight="fill" className="text-neutral-600" />
                        <div>
                          <p className="text-sm font-semibold text-dark">{trip.bus?.bus_name || "Bus"}</p>
                          <p className="text-xs text-neutral-500">{trip.bus?.type || "Standard"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className={trip.available_seats > 5 ? 'text-success' : 'text-warning'} />
                        <span className={`text-sm font-medium ${trip.available_seats > 5 ? 'text-success' : 'text-warning'}`}>
                          {trip.available_seats} places
                        </span>
                      </div>
                    </div>

                    {/* Prix & Action - Style simple */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatPrice(trip.price)}</p>
                        <p className="text-xs text-neutral-500">par personne</p>
                      </div>
                      <button
                        onClick={() => handleSelectTrip(trip)}
                        disabled={loading || trip.available_seats <= 0}
                        className={`
                          px-6 py-2.5 rounded-md font-medium text-sm transition-all
                          ${trip.available_seats <= 0 
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' 
                            : 'bg-primary hover:bg-primary-dark text-white'
                          }
                        `}
                      >
                        {trip.available_seats <= 0 ? 'Complet' : 'Réserver'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features (if bus has features) */}
                {trip.bus?.features && (
                  <div className="border-t-2 border-dashed border-gray-200 px-6 py-2 bg-gradient-to-r from-primary-50/50 via-secondary-50/50 to-primary-50/50">
                    <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">✨ Amenities & Services</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const features = typeof trip.bus.features === 'string' 
                            ? JSON.parse(trip.bus.features) 
                            : trip.bus.features;
                          return Array.isArray(features) && features.map((feature: string, index: number) => (
                            <span 
                              key={index}
                              className="text-xs bg-white px-4 py-2 rounded-lg text-gray-700 border border-primary/30 font-semibold shadow-sm hover:bg-primary hover:text-white hover:scale-105 transition-all"
                            >
                              ✓ {feature}
                            </span>
                          ));
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-white text-primary hover:text-white px-4 py-2 rounded-lg font-bold text-base border border-primary hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-md hover:scale-105"
            >
              <span className="text-lg">←</span>
              Back to Search
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this search?')) {
                  navigate("/")
                }
              }}
              className="inline-flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg font-bold text-base border border-red-600 transition-all duration-300 shadow-lg hover:shadow-md hover:scale-105"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TicketDetails








