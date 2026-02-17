import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getTicketDetails } from '../../services/api'
import { 
  CheckCircle, 
  Download, 
  MapPin, 
  Clock, 
  User,
  Ticket as TicketIcon,
  Bus,
  CreditCard,
  Calendar,
  ArrowRight,
  Phone,
  Envelope,
  IdentificationCard,
  GenderIntersex,
  Printer
} from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import NavBar from '../organs/NavBar'
import Footer from '../organs/Footer'
import QRCode from 'qrcode'

interface LocationState {
  reservationId: number
  ticketNumber?: string
}

const ProfessionalTicket = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as LocationState
  const { reservationId, ticketNumber } = state || {}

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const qrCodeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        if (ticketNumber) {
          const data = await getTicketDetails(ticketNumber)
          setTicket(data)
        } else if (reservationId) {
          const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}`)
          const result = await response.json()
          if (result.success) {
            setTicket(result.data)
          }
        }
      } catch (error) {
        console.error('Error fetching ticket:', error)
        toast.error('Failed to load ticket details')
      } finally {
        setLoading(false)
      }
    }

    fetchTicketDetails()
  }, [reservationId, ticketNumber])

  // Generate QR Code when ticket is loaded
  useEffect(() => {
    if (ticket && qrCodeRef.current) {
      const ticketNum = ticket?.ticket_number || `TKT${ticket?.id || '000000'}`
      QRCode.toCanvas(qrCodeRef.current, `http://localhost:8000/api/tickets/${ticketNum}`, {
        width: 120,
        margin: 1,
        errorCorrectionLevel: 'H'
      })
    }
  }, [ticket])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    toast.loading('Generating PDF...', { id: 'pdf' })

    try {
      const ticketNum = ticket?.ticket_number || ticket?.id
      
      // Download PDF from Laravel backend
      const response = await fetch(`http://localhost:8000/api/tickets/${ticketNum}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to download PDF from server')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `KCTrip_Ticket_${ticketNum}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF downloaded successfully!', { id: 'pdf' })
    } catch (e) {
      console.error('PDF generation failed:', e)
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf' })
    } finally {
      setDownloadingPdf(false)
    }
  }

  const formatTime = (time: string) => {
    if (!time) return "N/A"
    return time.substring(0, 5)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'FCFA')
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-color2 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your ticket...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const reservation = ticket?.reservation || ticket
  const trip = reservation?.trip || ticket?.trip
  const payment = reservation?.payment || ticket?.payment
  const ticketType = reservation?.ticket_type || ticket?.ticket_type || 'standard'
  const isVIP = ticketType === 'vip'
  const passengerFirstName = reservation?.passenger_first_name || ''
  const passengerLastName = reservation?.passenger_last_name || ''
  const passengerName = reservation?.passenger_name || `${passengerFirstName} ${passengerLastName}`.trim() || 'N/A'
  const passengerPhone = reservation?.passenger_phone || 'N/A'
  const passengerEmail = reservation?.passenger_email || 'N/A'
  const passengerGender = reservation?.passenger_gender === 'M' ? 'Male' : reservation?.passenger_gender === 'F' ? 'Female' : 'N/A'
  const passengerCNI = reservation?.passenger_cni || 'N/A'
  const passengerNationality = reservation?.passenger_nationality || 'Cameroon'
  const departureCity = trip?.departure?.city_name || '—'
  const destinationCity = trip?.destination?.city_name || '—'
  
  // Debug: Log the trip object to see what we're getting
  console.log('Trip data:', trip)
  console.log('Departure Agency:', trip?.departure_agency || trip?.departureAgency)
  console.log('Arrival Agency:', trip?.arrival_agency || trip?.arrivalAgency)
  
  // Support both snake_case (from API) and camelCase
  const departureAgency = trip?.departure_agency || trip?.departureAgency
  const arrivalAgency = trip?.arrival_agency || trip?.arrivalAgency
  
  const departureAgencyName = departureAgency?.agency_name || departureAgency?.neighborhood || 'N/A'
  const arrivalAgencyName = arrivalAgency?.agency_name || arrivalAgency?.neighborhood || 'N/A'
  const departureTime = trip?.departure_time || ''
  const arrivalTime = trip?.arrival_time || ''
  const departureDate = trip?.departure_date || trip?.date || ''
  const seatNumber = reservation?.selected_seat || ticket?.seat_number || 'N/A'
  const totalAmount = Number(payment?.amount ?? trip?.price ?? 0)
  const busName = trip?.bus?.bus_name || 'N/A'
  const busType = trip?.bus?.type || trip?.bus?.bus_type || 'Standard'
  const plateNumber = trip?.bus?.matricule || 'N/A'
  const ticketNum = ticket?.ticket_number || `TKT${ticket?.id || '000000'}`

  if (!ticket) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <TicketIcon size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 text-lg">Ticket not found</p>
            <button
              onClick={() => navigate("/")}
              className="text-color2 hover:text-color3 font-semibold underline"
            >
              Return to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #professional-ticket, #professional-ticket * {
            visibility: visible;
          }
          #professional-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="no-print">
        <NavBar />
      </div>
      
      <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-6">
          
          {/* Success Banner */}
          <div className="no-print bg-white rounded-lg shadow-lg p-3 mb-3 text-center border border-green-500">
            <CheckCircle size={80} weight="fill" className="text-green-500 mx-auto mb-4 " />
            <h1 className="text-lg font-semibold text-gray-900 mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Your bus ticket has been successfully issued
            </p>
            <p className="text-sm text-gray-500">
              Confirmation email sent to <span className="font-semibold text-color2">{passengerEmail}</span>
            </p>
          </div>

          {/* Simple Ticket - Like Reference Image */}
          <div id="professional-ticket" className={`rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto border-2 ${
            isVIP ? 'bg-gradient-to-br from-white via-yellow-50 to-amber-50 border-yellow-400' : 'bg-white border-gray-300'
          }`}>
            
            {/* Header with Logo */}
            <div className={`p-4 border-b ${isVIP ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src="/logo3.jpg" alt="KCTRIP" className="h-8" />
                {isVIP && <span className="text-2xl">⭐</span>}
              </div>
              <div className="text-center">
                <TicketIcon size={40} className={isVIP ? 'text-yellow-600 mx-auto' : 'text-gray-400 mx-auto'} />
                {isVIP && (
                  <div className="mt-2">
                    <span className="inline-block bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      VIP TICKET ⭐
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Content - Simple Format */}
            <div className="p-6 space-y-3">
              
              {/* Standard Ticket - Complete Info */}
              {!isVIP && (
                <>
                  {/* Nom */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Nom :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerLastName}</span>
                  </div>

                  {/* Prénom */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Prénom :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerFirstName}</span>
                  </div>

                  {/* Nationalité */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Nationalité :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerNationality}</span>
                  </div>

                  {/* Numéro de CNI */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Numéro de CNI :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold font-mono">{passengerCNI}</span>
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Numéro de téléphone :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerPhone}</span>
                  </div>

                  {/* Email */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Email :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold break-all">{passengerEmail}</span>
                  </div>

                  {/* Sexe */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Sexe :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerGender}</span>
                  </div>

                  {/* Lieu de départ */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Lieu de départ :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">
                      {departureAgencyName !== 'N/A' ? `${departureAgencyName} - ${departureCity}` : departureCity}
                    </span>
                  </div>

                  {/* Lieu d'arrivée */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Lieu d'arrivée :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">
                      {arrivalAgencyName !== 'N/A' ? `${arrivalAgencyName} - ${destinationCity}` : destinationCity}
                    </span>
                  </div>

                  {/* Agence de voyage */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Agence de voyage :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">KCTrip</span>
                  </div>

                  {/* Montant */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Montant :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{formatPrice(totalAmount)}</span>
                  </div>

                  {/* Siège */}
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Numéro de siège :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{seatNumber}</span>
                  </div>
                </>
              )}

              {/* VIP Ticket - Full Info */}
              {isVIP && (
                <>
                  {/* Nom */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Nom :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerLastName}</span>
                  </div>

                  {/* Prénom */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Prénom :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerFirstName}</span>
                  </div>

                  {/* Nationalité */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Nationalité :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerNationality}</span>
                  </div>

                  {/* Numéro de CNI */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Numéro de CNI :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold font-mono">{passengerCNI}</span>
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Numéro de téléphone :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerPhone}</span>
                  </div>

                  {/* Email */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Email :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold break-all">{passengerEmail}</span>
                  </div>

                  {/* Adresse de résidence */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Adresse de résidence :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{passengerEmail}</span>
                  </div>

                  {/* Lieu de départ */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Lieu de départ :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">
                      {departureAgencyName !== 'N/A' ? `${departureAgencyName} - ${departureCity}` : departureCity}
                    </span>
                  </div>

                  {/* Lieu d'arrivée */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Lieu d'arrivée :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">
                      {arrivalAgencyName !== 'N/A' ? `${arrivalAgencyName} - ${destinationCity}` : destinationCity}
                    </span>
                  </div>

                  {/* Agence de voyage */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Agence de voyage :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">KCTrip</span>
                  </div>

                  {/* Montant */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Montant :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold text-yellow-700">{formatPrice(totalAmount)}</span>
                  </div>

                  {/* Siège (VIP only) */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Numéro de siège :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{seatNumber}</span>
                  </div>

                  {/* Date de départ (VIP only) */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Date de départ :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{formatDate(departureDate)}</span>
                  </div>

                  {/* Heure de départ (VIP only) */}
                  <div className="flex border-b border-yellow-200 pb-2">
                    <span className="w-40 text-sm text-gray-600 font-medium">Heure de départ :</span>
                    <span className="flex-1 text-sm text-gray-900 font-semibold">{formatTime(departureTime)}</span>
                  </div>
                </>
              )}

              {/* QR Code */}
              <div className="flex justify-center pt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">QR Code</p>
                  <div className="bg-white p-2 border border-gray-300 rounded inline-block">
                    <canvas ref={qrCodeRef} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print mt-8 grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-sm  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Download size={24} weight="fill" />
              {downloadingPdf ? 'Generating...' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white text-gray-700 py-3 px-6 rounded-lg font-bold text-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-sm flex items-center justify-center gap-3"
            >
              <Printer size={24} weight="fill" />
              Print Ticket
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-sm  flex items-center justify-center gap-3"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      
      <div className="no-print">
        <Footer />
      </div>
    </>
  )
}

export default ProfessionalTicket





