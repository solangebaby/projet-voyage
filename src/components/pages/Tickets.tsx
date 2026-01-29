import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Trip } from "../../services/api"
import { Bus, Clock, MapPin, Users, Star } from "@phosphor-icons/react"
import toast from "react-hot-toast"
import NavBar from "../organs/NavBar"
import Footer from "../organs/Footer"

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Available Trips
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={16} weight="fill" className="text-color2" />
                <span className="font-medium">{departure}</span>
                <span>→</span>
                <span className="font-medium">{destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} weight="fill" className="text-color2" />
                <span>{new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {trips.length} trip(s) found
            </p>
          </div>

          {/* Trips List */}
          <div className="space-y-4">
            {trips.map((trip) => (
              <div 
                key={trip.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Time Info */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatTime(trip.departure_time)}
                        </p>
                        <p className="text-xs text-gray-500">Departure</p>
                      </div>
                      <div className="flex-1 hidden md:block">
                        <div className="border-t-2 border-dashed border-gray-300 relative">
                          <Bus 
                            size={20} 
                            className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-color2 bg-white px-1" 
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatTime(trip.arrival_time)}
                        </p>
                        <p className="text-xs text-gray-500">Arrival</p>
                      </div>
                    </div>

                    {/* Bus Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-color2/10 rounded-lg flex items-center justify-center">
                          <Bus size={24} weight="fill" className="text-color2" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {trip.bus?.bus_name || "Bus"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {trip.bus?.bus_type || "Standard"} • Plate: {trip.bus?.plate_number || "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {trip.available_seats} / {trip.bus?.total_seats || 0} seats available
                              </span>
                            </div>
                            {trip.bus?.bus_type === 'VIP' && (
                              <div className="flex items-center gap-1">
                                <Star size={14} weight="fill" className="text-yellow-500" />
                                <span className="text-xs text-gray-600">VIP</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end justify-center gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-color2">
                          {formatPrice(trip.price)}
                        </p>
                        <p className="text-xs text-gray-500">per seat</p>
                      </div>
                      <button
                        onClick={() => handleSelectTrip(trip)}
                        disabled={loading || trip.available_seats <= 0}
                        className={`
                          px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
                          ${trip.available_seats <= 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-color2 text-white hover:bg-color3 hover:scale-105'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {trip.available_seats <= 0 ? 'Sold Out' : 'Select Trip'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features (if bus has features) */}
                {trip.bus?.features && (
                  <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const features = typeof trip.bus.features === 'string' 
                            ? JSON.parse(trip.bus.features) 
                            : trip.bus.features;
                          return Array.isArray(features) && features.map((feature: string, index: number) => (
                            <span 
                              key={index}
                              className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border border-gray-200"
                            >
                              {feature}
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

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-color2 hover:text-color3 font-medium text-sm"
            >
              ← Back to Search
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TicketDetails
