import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { createReservation, initiatePayment, verifyPayment, authService } from '../../services/api'
import { 
  CreditCard, 
  DeviceMobile, 
  CheckCircle, 
  MapPin, 
  Clock, 
  User,
  Envelope,
  Phone
} from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import NavBar from '../organs/NavBar'
import Footer from '../organs/Footer'

interface LocationState {
  trip: any
  selectedSeats: string[]
  ticketType: 'standard' | 'vip'
  passengerInfo: {
    firstName: string
    lastName: string
    phone: string
    email: string
    gender: 'M' | 'F'
    cni: string
  }
  departure: string
  destination: string
  date: string
  totalPrice: number
}

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as LocationState
  const { trip, selectedSeats, ticketType, passengerInfo, departure, destination, date, totalPrice } = state || {}

  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | ''>('')
  const [mobileProvider, setMobileProvider] = useState<'MTN' | 'Orange' | 'Moov' | ''>('')
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatTime = (time: string) => {
    if (!time) return "N/A"
    return time.substring(0, 5)
  }

  // Fonction pour détecter l'opérateur à partir du numéro
  const detectOperator = (phone: string): 'MTN' | 'Orange' | null => {
    // Enlever le +237 et les espaces
    const cleanPhone = phone.replace(/[\s+]/g, '').replace(/^237/, '')
    
    // MTN: 67, 650-654, 680-684
    const mtnPrefixes = ['67', '650', '651', '652', '653', '654', '680', '681', '682', '683', '684']
    
    // Orange: 69, 655-659, 685-689
    const orangePrefixes = ['69', '655', '656', '657', '658', '659', '685', '686', '687', '688', '689']
    
    for (const prefix of mtnPrefixes) {
      if (cleanPhone.startsWith(prefix)) return 'MTN'
    }
    
    for (const prefix of orangePrefixes) {
      if (cleanPhone.startsWith(prefix)) return 'Orange'
    }
    
    return null
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (paymentMethod === 'mobile_money' && !mobileProvider) {
      toast.error('Please select a mobile money provider')
      return
    }

    // Validation: vérifier la correspondance opérateur/numéro
    if (paymentMethod === 'mobile_money' && mobileProvider) {
      const detectedOperator = detectOperator(passengerInfo.phone)
      
      if (detectedOperator && detectedOperator !== mobileProvider) {
        toast.error(`Erreur: Vous avez sélectionné ${mobileProvider} mais votre numéro est ${detectedOperator}. Veuillez corriger.`)
        return
      }
      
      if (!detectedOperator) {
        toast.error('Numéro de téléphone invalide. Veuillez vérifier.')
        return
      }
    }

    // Vérifier l'authentification - Si pas connecté, créer un compte automatiquement
    let user = authService.getUser()
    if (!user) {
      toast.loading('Creating your account...', { id: 'register' })
      try {
        // Generate a secure random password (min 8 chars)
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4)
        
        // Auto-register the user with passenger info
        const registerData = {
          name: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
          first_name: passengerInfo.firstName,
          email: passengerInfo.email,
          phone: passengerInfo.phone,
          password: randomPassword,
          password_confirmation: randomPassword,
          role: 'voyageur'
        }
        
        const { default: api, register } = await import('../../services/api')
        const response = await register(registerData)
        
        // Check if response contains token (should be in response.data)
        const token = response.data?.token || response.token
        const userData = response.data?.user || response.data || response.user
        
        if (!token) {
          throw new Error('No token received from registration')
        }
        
        // Save auth token and user
        authService.setToken(token)
        authService.setUser(userData)
        user = userData
        
        toast.success('Account created successfully!', { id: 'register' })
      } catch (error: any) {
        toast.dismiss('register')
        console.error('Auto-registration error:', error)
        
        // If user already exists, try to login
        if (error.response?.data?.message?.includes('email')) {
          toast.error('Please login with your existing account')
          sessionStorage.setItem('pending_booking', JSON.stringify({
            trip,
            selectedSeats,
            passengerInfo,
            departure,
            destination,
            date,
            totalPrice,
            paymentMethod,
            mobileProvider
          }))
          navigate('/admin/login', { state: { from: '/payment' } })
          return
        }
        
        toast.error('Failed to create account. Please try again.')
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setPaymentStep('processing')

    try {
      // Étape 1: Créer la réservation
      toast.loading('Creating reservation...', { id: 'reservation' })
      
      const reservationData = {
        trip_id: trip.id,
        selected_seat: selectedSeats[0], // Pour l'instant, on prend le premier siège
        ticket_type: ticketType || 'standard',
        passenger_first_name: passengerInfo.firstName,
        passenger_last_name: passengerInfo.lastName,
        passenger_email: passengerInfo.email,
        passenger_phone: passengerInfo.phone,
        passenger_gender: passengerInfo.gender,
        passenger_cni: passengerInfo.cni
      }

      const reservation = await createReservation(reservationData)
      toast.success('Reservation created!', { id: 'reservation' })

      // Étape 2: Initialiser le paiement
      toast.loading('Initiating payment...', { id: 'payment' })
      
      const paymentData = {
        reservation_id: reservation.id,
        amount: Number(totalPrice),
        payment_method: paymentMethod === 'mobile_money' ? `mobile_money_${mobileProvider}` : 'card',
        phone_number: paymentMethod === 'mobile_money' ? String(passengerInfo.phone || '') : undefined,
      }
      console.log('Initiating payment with data:', paymentData)

      const payment = await initiatePayment(paymentData)
      toast.success('Payment initiated!', { id: 'payment' })

      // Log pour debug
      console.log('Payment response:', payment)

      // Étape 3: Simuler le traitement du paiement (1 seconde pour améliorer la vitesse)
      toast.loading('Processing payment...', { id: 'verify' })
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Étape 4: Vérifier le paiement
      // Le backend retourne { payment: {...}, reservation: {...}, amount: ... }
      const transactionId = payment.payment?.transaction_id || payment.transaction_id
      
      if (!transactionId) {
        console.error('No transaction_id in payment response:', payment)
        throw new Error('No transaction ID received from payment initiation')
      }
      
      const verifyResponse = await verifyPayment(transactionId)

      if (verifyResponse.success) {
        toast.success('Payment successful!', { id: 'verify' })
        setPaymentStep('success')

        // Get ticket number from response
        const ticketNumber = verifyResponse.data?.ticket?.ticket_number || verifyResponse.ticket_number

        // Redirection vers la page de ticket après 2 secondes
        setTimeout(() => {
          navigate('/ticket', {
            state: { 
              reservationId: reservation.id,
              ticketNumber: ticketNumber
            }
          })
        }, 2000)
      } else {
        throw new Error('Payment verification failed')
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error response FULL:', JSON.stringify(error.response?.data, null, 2))
      console.error('Error status:', error.response?.status)
      setPaymentStep('select')
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.data?.errors) {
        // Afficher les erreurs de validation
        const errors = error.response.data.errors
        const firstError = Object.values(errors)[0]
        toast.error(Array.isArray(firstError) ? firstError[0] : 'Validation error')
        console.error('Validation errors:', errors)
      } else {
        toast.error(error.message || 'Payment failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!trip || !passengerInfo) {
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
      <div className="min-h-screen pt-20 bg-gray-50 py-6">
        <div className="max-w-full md:max-w-4xl px-3 md:px-0 mx-auto px-4 sm:px-6 lg:px-6">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-900 mb-2">
              Payment
            </h1>
            <p className="text-gray-600">Complete your payment to confirm your booking</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Left: Payment Method Selection */}
            <div className="lg:col-span-2">
              {paymentStep === 'select' && (
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Payment Method
                  </h2>

                  {/* Mobile Money */}
                  <div className="mb-4">
                    <button
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        paymentMethod === 'mobile_money'
                          ? 'border-color2 bg-color2/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DeviceMobile size={24} weight="fill" className="text-color2" />
                        <div>
                          <p className="font-semibold text-gray-900">Mobile Money</p>
                          <p className="text-sm text-gray-600">MTN, Orange</p>
                        </div>
                      </div>
                    </button>

                    {paymentMethod === 'mobile_money' && (
                      <div className="mt-3 ml-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Select Provider:</p>
                        {['MTN', 'Orange'].map((provider) => (
                          <label key={provider} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="provider"
                              value={provider}
                              checked={mobileProvider === provider}
                              onChange={(e) => setMobileProvider(e.target.value as any)}
                              className="text-color2 focus:ring-color2"
                            />
                            <span className="text-gray-700">{provider} Money</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Payment */}
                  <div className="mb-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        paymentMethod === 'card'
                          ? 'border-color2 bg-color2/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={24} weight="fill" className="text-color2" />
                        <div>
                          <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                          <p className="text-sm text-gray-600">Visa, Mastercard (Simulated)</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This is a simulated payment. No actual charges will be made.
                    </p>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading || !paymentMethod}
                    className="w-full bg-color2 text-white py-3 rounded-lg font-semibold hover:bg-color3 transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? 'Processing Payment...' : `Pay ${formatPrice(totalPrice)}`}
                  </button>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => navigate(-1)}
                      disabled={loading}
                      className="flex-1 bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 hover:border-color2 transition-all duration-200 disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this payment? Your reservation will be lost.')) {
                          navigate("/")
                        }
                      }}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold border border-red-600 hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="bg-white rounded-lg shadow-sm p-3 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-color2 mx-auto mb-4"></div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Processing Payment...</h3>
                  <p className="text-gray-600">Please wait while we process your payment</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="bg-white rounded-lg shadow-sm p-3 text-center">
                  <CheckCircle size={64} weight="fill" className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-4">Your booking has been confirmed</p>
                  <p className="text-sm text-gray-500">Redirecting to your ticket...</p>
                </div>
              )}
            </div>

            {/* Right: Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-3 sticky top-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h2>

                <div className="space-y-4 mb-3">
                  {/* Trip Details */}
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin size={18} weight="fill" className="text-color2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Route</p>
                        <p className="font-medium text-gray-900">{departure} → {destination}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock size={18} weight="fill" className="text-color2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Date & Time</p>
                        <p className="font-medium text-gray-900">
                          {new Date(date).toLocaleDateString()} • {formatTime(trip.departure_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Info */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Passenger</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-500" />
                        <span className="text-gray-900">
                          {passengerInfo.firstName} {passengerInfo.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-gray-500" />
                        <span className="text-gray-900">{passengerInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Envelope size={14} className="text-gray-500" />
                        <span className="text-gray-900">{passengerInfo.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Seat(s)</span>
                      <span className="font-medium text-gray-900">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Price per seat</span>
                      <span className="font-medium text-gray-900">{formatPrice(trip.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600">Quantity</span>
                      <span className="font-medium text-gray-900">×{selectedSeats.length}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-base font-bold text-color2">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Payment





