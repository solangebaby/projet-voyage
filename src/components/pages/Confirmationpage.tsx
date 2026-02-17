import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getTicketDetails, downloadTicket } from '../../services/api'
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
  ArrowRight
} from '@phosphor-icons/react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import NavBar from '../organs/NavBar'
import Footer from '../organs/Footer'

interface LocationState {
  reservationId: number
  ticketNumber?: string
}

const Confirmationpage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as LocationState
  const { reservationId, ticketNumber } = state || {}

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    if (!reservationId) {
      toast.error("No reservation data available")
      setTimeout(() => navigate("/"), 2000)
      return
    }

    loadTicketDetails()
  }, [reservationId])

  const loadTicketDetails = async () => {
    try {
      setLoading(true)
      const ticketData = ticketNumber 
        ? await getTicketDetails(ticketNumber)
        : await getTicketDetails(reservationId.toString())
      
      setTicket(ticketData)
    } catch (error: any) {
      console.error('Error loading ticket:', error)
      toast.error('Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!ticket) return

    try {
      setDownloadingPdf(true)
      toast.loading('Generating PDF...', { id: 'pdf' })

      const pdfBlob = await downloadTicket(ticket.ticket_number || ticket.id)
      
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ticket_${ticket.ticket_number || ticket.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF downloaded successfully!', { id: 'pdf' })
    } catch (error: any) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download server PDF. Try "Download Exact" to export exactly as displayed.', { id: 'pdf' })
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Download exactly as displayed (includes QR from DOM). Loads libs from CDN if missing.
  const handleDownloadExact = async () => {
    if (!ticket) return
    setDownloadingPdf(true)
    try {
      const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.body.appendChild(s)
      })

      const w = window as any
      if (!w.html2canvas) {
        await loadScript('https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js')
      }
      if (!w.jspdf || !w.jspdf.jsPDF) {
        await loadScript('https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js')
      }

      const node = document.getElementById('ticket-content')
      if (!node) throw new Error('Ticket content not found')

      const html2canvas = (window as any).html2canvas
      const { jsPDF } = (window as any).jspdf

      const canvas = await html2canvas(node, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`ticket_${ticket.ticket_number || ticket.id}.pdf`)
      toast.success('PDF exported (exact view)!', { id: 'pdf' })
    } catch (e) {
      console.error('Exact export failed:', e)
      toast.error('Exact export failed. Please try again.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const formatTime = (time: string) => {
    if (!time) return "N/A"
    return time.substring(0, 5)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color2 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ticket...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Derive safe accessors for display
  const reservation = ticket?.reservation || ticket
  const trip = reservation?.trip || ticket?.trip
  const passengerName = reservation?.passenger_name || reservation?.user?.name || 'N/A'
  const passengerPhone = reservation?.passenger_phone || 'N/A'
  const departureCity = trip?.departure?.city_name || trip?.departure || ticket?.departure || '—'
  const destinationCity = trip?.destination?.city_name || trip?.destination || ticket?.destination || '—'
  const departureTime = trip?.departure_time || ticket?.departure_time || ''
  const arrivalTime = trip?.arrival_time || ticket?.arrival_time || ''
  const departureDate = trip?.departure_date || trip?.date || ticket?.date || ''
  const seatNumber = reservation?.selected_seat || ticket?.selected_seat || ticket?.seat_number || 'N/A'
  const totalAmount = Number(reservation?.payment?.amount ?? ticket?.total_price ?? trip?.bus?.price ?? 0) || 0
  const busName = trip?.bus?.bus_name || trip?.bus?.brand || trip?.bus?.internal_number || 'N/A'
  const plateNumber = trip?.bus?.matricule || trip?.bus?.registration || trip?.bus?.plate_number || 'N/A'

  if (!ticket) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ticket not found</p>
            <button
              onClick={() => navigate("/")}
              className="text-color2 hover:text-color3 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
            <CheckCircle size={64} weight="fill" className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-4">
              Your ticket has been successfully generated
            </p>
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to {ticket.passenger_email || 'your email'}
            </p>
          </div>

          {/* Ticket Card */}
          <div id="ticket-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-color2 to-color3 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">E-Ticket</h2>
                  <p className="text-sm opacity-90">KCTrip</p>
                </div>
                <TicketIcon size={48} weight="fill" />
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-6 md:p-8">
              {/* Ticket Number */}
              <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-1">Ticket Number</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ticket.ticket_number || `#${ticket.id}`}
                </p>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">From</p>
                      <p className="text-xl font-bold text-gray-900">
                        {departureCity}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(departureTime)}
                      </p>
                    </div>
                    
                    <ArrowRight size={32} weight="bold" className="text-color2 flex-shrink-0" />
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">To</p>
                      <p className="text-xl font-bold text-gray-900">
                        {destinationCity}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(arrivalTime)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-color2" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {departureDate ? new Date(departureDate).toLocaleDateString('fr-FR', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                          }) : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Bus size={20} className="text-color2" />
                      <div>
                        <p className="text-xs text-gray-500">Seat Number</p>
                        <p className="font-bold text-xl text-color2">
                          {seatNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-center justify-center md:border-l-2 md:border-dashed md:border-gray-300">
                  <div className="text-center">
                    <QRCodeSVG 
                      value={`http://localhost:8000/api/tickets/${ticket.ticket_number || ticket.id}`}
                      size={120}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={20} className="text-color2" />
                  Passenger Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {passengerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">
                      {passengerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bus Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Bus size={20} className="text-color2" />
                  Bus Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Bus Name</p>
                    <p className="font-medium text-gray-900">
                      {busName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bus Type</p>
                    <p className="font-medium text-gray-900">
                      {trip?.bus?.type?.toUpperCase?.() || trip?.bus?.bus_type || 'Standard'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Plate Number</p>
                    <p className="font-medium text-gray-900">
                      {plateNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard size={20} className="text-color2" />
                    <span>Total Amount Paid</span>
                  </span>
                  <span className="text-2xl font-bold text-color2">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please arrive at the departure station at least 30 minutes before departure time. 
                  Present this ticket (digital or printed) and a valid ID at check-in.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Booked on {new Date(ticket.created_at || Date.now()).toLocaleDateString()} • Status: 
                <span className={`ml-1 font-medium ${
                  ticket.status === 'confirmed' ? 'text-green-600' : 
                  ticket.status === 'cancelled' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {ticket.status?.toUpperCase() || 'CONFIRMED'}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex-1 bg-color2 text-white py-3 px-6 rounded-lg font-semibold hover:bg-color3 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {downloadingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Print Ticket
            </button>

            <button
              onClick={() => navigate('/traveler/dashboard')}
              className="flex-1 bg-white text-color2 py-3 px-6 rounded-lg font-semibold border-2 border-color2 hover:bg-color2 hover:text-white transition-all duration-200"
            >
              My Bookings
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Confirmationpage
