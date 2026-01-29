import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Trip } from '../../services/api'
import SeatSelector from '../SeatSelector'
import { MapPin, Clock, Bus, User, Phone, Envelope, CreditCard } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import NavBar from '../organs/NavBar'
import Footer from '../organs/Footer'

interface LocationState {
  trip: Trip
  departure: string
  destination: string
  date: string
}

interface PassengerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
}

const Confirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as LocationState
  const { trip, departure, destination, date } = state || {}

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Vérifier que nous avons les données nécessaires
    if (!trip) {
      toast.error("No trip data available. Please select a trip first.")
      setTimeout(() => {
        navigate("/")
      }, 2000)
    }
  }, [trip, navigate])

  const handleSeatSelect = (seat: string) => {
    setSelectedSeat(seat)
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

  const calculateTotal = () => {
    return trip.price
  }

  const handleContinueToPayment = () => {
    // Validation
    if (!selectedSeat) {
      toast.error('Please select a seat')
      return
    }

    if (!passengerInfo.firstName.trim()) {
      toast.error('Please enter your first name')
      return
    }

    if (!passengerInfo.lastName.trim()) {
      toast.error('Please enter your last name')
      return
    }

    if (!passengerInfo.phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (!passengerInfo.email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(passengerInfo.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Validation téléphone (simple)
    const phoneRegex = /^[0-9+\s-()]{9,}$/
    if (!phoneRegex.test(passengerInfo.phone)) {
      toast.error('Please enter a valid phone number')
      return
    }

    setLoading(true)
    toast.success('Proceeding to payment...')

    setTimeout(() => {
      navigate('/payment', {
        state: {
          trip,
          selectedSeats: [selectedSeat],
          passengerInfo,
          departure,
          destination,
          date,
          totalPrice: calculateTotal()
        }
      })
      setLoading(false)
    }, 800)
  }

  if (!trip) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Booking
            </h1>
            <p className="text-gray-600">Select your seat and enter passenger information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Seat Selection & Passenger Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Summary Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Route</p>
                      <p className="font-medium text-gray-900">{departure} → {destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={20} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {new Date(date).toLocaleDateString()} • {formatTime(trip.departure_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bus size={20} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Bus</p>
                      <p className="font-medium text-gray-900">{trip.bus?.bus_name || 'Bus'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Price per seat</p>
                      <p className="font-medium text-gray-900">{formatPrice(trip.price)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Your Seat(s)
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Click on available seats to select. You can select multiple seats.
                </p>
                <SeatSelector
                  totalSeats={trip.bus?.total_seats || 40}
                  occupiedSeats={trip.occupied_seats || []}
                  onSeatSelect={handleSeatSelect}
                  selectedSeat={selectedSeat}
                />
                {selectedSeat && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Selected seat: {selectedSeat}
                    </p>
                  </div>
                )}
              </div>

              {/* Passenger Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Passenger Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={passengerInfo.firstName}
                      onChange={(e) => setPassengerInfo({...passengerInfo, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={passengerInfo.lastName}
                      onChange={(e) => setPassengerInfo({...passengerInfo, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={passengerInfo.phone}
                      onChange={(e) => setPassengerInfo({...passengerInfo, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Envelope size={16} className="inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={passengerInfo.email}
                      onChange={(e) => setPassengerInfo({...passengerInfo, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  * All fields are required. Your ticket will be sent to this email address.
                </p>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per seat</span>
                    <span className="font-medium text-gray-900">{formatPrice(trip.price)}</span>
                  </div>
                  {selectedSeat && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected seat</span>
                      <span className="font-medium text-gray-900">{selectedSeat}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-color2">
                        {selectedSeat ? formatPrice(calculateTotal()) : formatPrice(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinueToPayment}
                  disabled={loading || !selectedSeat}
                  className="w-full bg-color2 text-white py-3 rounded-lg font-semibold hover:bg-color3 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full mt-3 bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Back to Trips
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Confirmation
