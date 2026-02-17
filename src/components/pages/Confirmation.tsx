import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Trip } from '../../services/api'
import SeatSelector from '../SeatSelector'
import { MapPin, Clock, Bus, User, Phone, Envelope, CreditCard, Armchair, CheckCircle } from '@phosphor-icons/react'
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
  gender: 'M' | 'F' | ''
  cni: string
  nationality: string
}

type TicketType = 'standard' | 'vip'

const Confirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as LocationState
  const { trip, departure, destination, date } = state || {}

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [ticketType, setTicketType] = useState<TicketType>('standard')
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    cni: '',
    nationality: 'Cameroon'
  })
  const [loading, setLoading] = useState(false)
  const [availableSeats, setAvailableSeats] = useState<number>(0)
  const [previousAvailableSeats, setPreviousAvailableSeats] = useState<number>(0)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Vérifier que nous avons les données nécessaires
    if (!trip) {
      toast.error("No trip data available. Please select a trip first.")
      setTimeout(() => {
        navigate("/")
      }, 2000)
      return
    }
    
    // Fetch trip details with reserved seats
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/trips/${trip.id}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const totalSeats = data.data.bus?.total_seats || 40
          const reservedSeats = data.data.reserved_seats || []
          const available = totalSeats - reservedSeats.length
          setAvailableSeats(available)
          setPreviousAvailableSeats(available)
          
          // Store reserved seats in trip data
          trip.occupied_seats = reservedSeats
        }
      } catch (error) {
        console.error('Error fetching trip details:', error)
        // Fallback to existing data
        const totalSeats = trip.bus?.total_seats || 40
        const occupiedSeatsCount = trip.occupied_seats?.length || 0
        const available = totalSeats - occupiedSeatsCount
        setAvailableSeats(available)
        setPreviousAvailableSeats(available)
      }
    }
    
    fetchTripDetails()
  }, [trip, navigate])

  useEffect(() => {
    // Scroll automatique vers le formulaire quand un siège est sélectionné
    if (selectedSeat && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 300)
    }
  }, [selectedSeat])

  const handleSeatSelect = (seat: string) => {
    // Animation de décrémentation
    if (seat && !selectedSeat) {
      setPreviousAvailableSeats(availableSeats)
      setAvailableSeats(prev => prev - 1)
    }
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
    const basePrice = trip.price
    // VIP costs 50% more than standard
    return ticketType === 'vip' ? basePrice * 1.5 : basePrice
  }

  const handleContinueToPayment = () => {
    // Validation
    if (!selectedSeat) {
      toast.error('Please select a seat')
      return
    }

    // Validation nom et prénom (lettres alphabétiques A-Z avec accents et espaces uniquement)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    
    if (!passengerInfo.firstName.trim()) {
      toast.error('Please enter your first name')
      return
    }
    
    if (!nameRegex.test(passengerInfo.firstName)) {
      toast.error('First name must contain only letters')
      return
    }

    if (!passengerInfo.lastName.trim()) {
      toast.error('Please enter your last name')
      return
    }
    
    if (!nameRegex.test(passengerInfo.lastName)) {
      toast.error('Last name must contain only letters')
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

    // Validation gender
    if (!passengerInfo.gender) {
      toast.error('Please select your gender')
      return
    }

    // Validation CNI (Cameroonian format: 2 uppercase letters + 8 digits)
    if (!passengerInfo.cni.trim()) {
      toast.error('Please enter your ID number (CNI)')
      return
    }

    const cniRegex = /^[A-Z]{2}[0-9]{8}$/
    if (!cniRegex.test(passengerInfo.cni)) {
      toast.error('Invalid CNI format (2 uppercase letters + 8 digits, e.g: AB12345678)')
      return
    }

    // Validation nationality
    if (!passengerInfo.nationality.trim()) {
      toast.error('Please select your nationality')
      return
    }

    setLoading(true)
    toast.success('Proceeding to payment...')

    setTimeout(() => {
      navigate('/payment', {
        state: {
          trip,
          selectedSeats: [selectedSeat],
          ticketType,
          passengerInfo: {
            ...passengerInfo,
            passenger_nationality: passengerInfo.nationality
          },
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
      <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
          {/* Header compact */}
          <div className="mb-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-color2 to-color3 rounded-full mb-3 shadow-lg">
              <Bus size={28} weight="fill" className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-color1 to-color2 bg-clip-text text-transparent mb-1">
              Complete Your Booking
            </h1>
            <p className="text-gray-600 text-sm">Select your seat and enter your information</p>
            
            {/* Available seats indicator - compact */}
            <div className="mt-3 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Armchair size={20} weight="fill" className="text-color2" />
              <span className="text-xs text-gray-600">Available:</span>
              <span className={`text-base font-bold transition-all duration-500 ${
                availableSeats < previousAvailableSeats ? 'text-color2 scale-110' : 'text-gray-900'
              }`}>
                {availableSeats}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column: Seat Selection & Passenger Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Trip Summary Card - Compact */}
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-color2">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Bus size={20} weight="fill" className="text-color2" />
                  Trip Details
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Route</p>
                      <p className="font-semibold text-sm text-gray-900">{departure} → {destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Date & Time</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {new Date(date).toLocaleDateString()} • {formatTime(trip.departure_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bus size={18} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Bus</p>
                      <p className="font-semibold text-sm text-gray-900">{trip.bus?.bus_name || 'Bus'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} weight="fill" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-bold text-sm text-color2">{formatPrice(trip.price)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Selection - Compact */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Armchair size={20} weight="fill" className="text-color2" />
                  Select Your Seat
                </h2>
                <p className="text-xs text-gray-600 mb-3 bg-blue-50 p-2 rounded border-l-2 border-color2">
                  💡 Click on an available seat
                </p>
                <SeatSelector
                  totalSeats={trip.bus?.total_seats || 40}
                  occupiedSeats={trip.occupied_seats || []}
                  onSeatSelect={handleSeatSelect}
                  selectedSeat={selectedSeat}
                />
                {selectedSeat && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={24} weight="fill" className="text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Selected Seat</p>
                        <p className="text-base font-bold text-green-700">{selectedSeat}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ticket Type Selection */}
              {selectedSeat && (
                <div className="bg-white rounded-lg shadow-md p-4 border border-color2">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CreditCard size={20} weight="fill" className="text-color2" />
                    Choose Ticket Type
                  </h2>
                  <p className="text-xs text-gray-600 mb-3 bg-purple-50 p-2 rounded border-l-2 border-purple-400">
                    ⭐ Select your preferred ticket class
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Standard Ticket */}
                    <button
                      onClick={() => setTicketType('standard')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        ticketType === 'standard'
                          ? 'border-color2 bg-color2/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">Standard</h3>
                          <p className="text-xs text-gray-600 mt-1">Basic comfort</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          ticketType === 'standard' ? 'border-color2 bg-color2' : 'border-gray-300'
                        }`}>
                          {ticketType === 'standard' && (
                            <CheckCircle size={20} weight="fill" className="text-white" />
                          )}
                        </div>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>✓ Regular seat</li>
                        <li>✓ Standard service</li>
                        <li>✓ Basic ticket info</li>
                      </ul>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="font-bold text-color2">{formatPrice(trip.price)}</p>
                      </div>
                    </button>

                    {/* VIP Ticket */}
                    <button
                      onClick={() => setTicketType('vip')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        ticketType === 'vip'
                          ? 'border-yellow-500 bg-yellow-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base flex items-center gap-1">
                            VIP <span className="text-yellow-500">⭐</span>
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">Premium experience</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          ticketType === 'vip' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                        }`}>
                          {ticketType === 'vip' && (
                            <CheckCircle size={20} weight="fill" className="text-white" />
                          )}
                        </div>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>✓ Priority boarding</li>
                        <li>✓ Extra comfort seat</li>
                        <li>✓ Premium ticket design</li>
                        <li>✓ Full passenger details</li>
                      </ul>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="font-bold text-yellow-600">{formatPrice(trip.price * 1.5)}</p>
                        <p className="text-xs text-gray-500">+50% premium</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Passenger Information - Compact */}
              {selectedSeat && (
                <div ref={formRef} className="bg-white rounded-lg shadow-md p-4 border border-color2">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <User size={20} weight="fill" className="text-color2" />
                    Passenger Information
                  </h2>
                  <p className="text-xs text-gray-600 mb-3 bg-orange-50 p-2 rounded border-l-2 border-color3">
                    ✍️ Fill in your personal information
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={passengerInfo.firstName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
                            setPassengerInfo({...passengerInfo, firstName: value});
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent"
                        placeholder="Jean"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={passengerInfo.lastName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
                            setPassengerInfo({...passengerInfo, lastName: value});
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent"
                        placeholder="Dupont"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <span className="text-base">🇨🇲</span>
                          <span className="text-sm text-gray-700 font-semibold">+237</span>
                        </span>
                        <input
                          type="tel"
                          value={passengerInfo.phone}
                          onChange={(e) => setPassengerInfo({...passengerInfo, phone: e.target.value})}
                          className="w-full pl-20 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent"
                          placeholder="6XX XXX XXX"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={passengerInfo.email}
                        onChange={(e) => setPassengerInfo({...passengerInfo, email: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent"
                        placeholder="exemple@email.com"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={passengerInfo.gender}
                        onChange={(e) => setPassengerInfo({...passengerInfo, gender: e.target.value as 'M' | 'F' | ''})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent bg-white"
                        required
                      >
                        <option value="">Select</option>
                        <option value="M">👨 Male</option>
                        <option value="F">👩 Female</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ID Number (CNI) *
                      </label>
                      <input
                        type="text"
                        value={passengerInfo.cni}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          if (value === '' || /^[A-Z]{0,2}[0-9]{0,8}$/.test(value)) {
                            setPassengerInfo({...passengerInfo, cni: value});
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent uppercase tracking-wider font-mono"
                        placeholder="AB12345678"
                        required
                        maxLength={10}
                      />
                    </div>

                    {/* Nationality Field */}
                    <div className="group md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nationality *
                      </label>
                      <select
                        value={passengerInfo.nationality}
                        onChange={(e) => setPassengerInfo({...passengerInfo, nationality: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 focus:border-transparent"
                        required
                      >
                        <option value="Cameroon">Cameroon</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Chad">Chad</option>
                        <option value="Central African Republic">Central African Republic</option>
                        <option value="Gabon">Gabon</option>
                        <option value="Equatorial Guinea">Equatorial Guinea</option>
                        <option value="Congo">Congo</option>
                        <option value="France">France</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-color2">
                    <p className="text-xs text-gray-700 flex items-center gap-2">
                      <span>📧</span>
                      <span>Ticket will be sent to your email</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Summary - Compact */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-24 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard size={20} weight="fill" className="text-color2" />
                  Summary
                </h2>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Base Price</span>
                    <span className="font-bold text-sm text-gray-900">{formatPrice(trip.price)}</span>
                  </div>
                  {selectedSeat && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-xs text-gray-600">Seat</span>
                        <span className="font-bold text-green-700">{selectedSeat}</span>
                      </div>
                      <div className={`flex justify-between items-center p-2 rounded border ${
                        ticketType === 'vip' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <span className="text-xs text-gray-600">Ticket Type</span>
                        <span className={`font-bold ${ticketType === 'vip' ? 'text-yellow-700' : 'text-blue-700'}`}>
                          {ticketType === 'vip' ? '⭐ VIP' : 'Standard'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="border-t-2 border-gray-200 pt-2">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-color2 to-color3 rounded-lg">
                      <span className="text-sm font-semibold text-white">Total</span>
                      <span className="text-base font-bold text-white">
                        {selectedSeat ? formatPrice(calculateTotal()) : formatPrice(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinueToPayment}
                  disabled={loading || !selectedSeat}
                  className="w-full bg-gradient-to-r from-color2 to-color3 text-white py-2.5 rounded-lg font-bold text-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment →
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full mt-2 bg-white text-gray-700 py-2.5 rounded-lg font-semibold text-sm border border-gray-300 hover:bg-gray-50 hover:border-color2 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  ← Back to Trips
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this booking? All entered information will be lost.')) {
                      navigate("/")
                    }
                  }}
                  className="w-full mt-2 bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm border border-red-600 hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  ✕ Cancel
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






