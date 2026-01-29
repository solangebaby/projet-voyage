import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import { 
  Ticket as TicketIcon, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Bus,
  CurrencyDollar,
  DownloadSimple,
  CheckCircle,
  ArrowLeft 
} from '@phosphor-icons/react';
import { Button } from '../atoms/Button';
import toast from 'react-hot-toast';

const TicketPreview = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    departure, 
    destination, 
    date, 
    departureTime, 
    arrivalTime, 
    ticket, 
    passengerInfo, 
    selectedSeat 
  } = location.state || {};

  // Generate ticket number
  const ticketNumber = `JT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const handleProceedToPayment = () => {
    toast.success(t('payment.processing'));
    setTimeout(() => {
      navigate('/payment', {
        state: {
          departure,
          destination,
          date,
          departureTime,
          arrivalTime,
          ticket,
          passengerInfo,
          selectedSeat,
          ticketNumber
        }
      });
    }, 800);
  };

  if (!ticket || !passengerInfo || !selectedSeat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-24">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <p className="text-red-600 font-bold text-xl mb-4">Invalid booking data</p>
          <Button
            type="button"
            onClick={() => navigate('/')}
            className="bg-color2 text-white px-6 py-3 rounded-lg hover:bg-color3 transition"
          >
            {t('common.back')} to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 mt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-color2 to-color3 text-white py-8 px-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white/80 hover:text-white transition flex items-center gap-2 group"
          >
            <ArrowLeft size={22} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('common.back')}</span>
          </button>
          
          <h1 className="text-4xl font-bold">{t('ticket.title')} Preview</h1>
          <p className="text-white/90 mt-2">Review your booking details before payment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Ticket Preview Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-dashed border-gray-300">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-color2 to-color3 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TicketIcon size={32} weight="duotone" />
                <div>
                  <p className="text-sm opacity-90">Jadoo Travels</p>
                  <p className="text-2xl font-bold">{t('ticket.ticketNumber')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle size={20} weight="fill" />
                  <span className="font-bold">Pending Payment</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-3xl font-mono font-bold tracking-wider">{ticketNumber}</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Journey Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-color2 pb-2">
                  Journey Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={24} weight="duotone" className="text-color2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{t('ticket.departure')} → {t('ticket.arrival')}</p>
                      <p className="font-bold text-lg text-gray-900">{departure} → {destination}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar size={24} weight="duotone" className="text-color2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{t('ticket.date')}</p>
                      <p className="font-bold text-lg text-gray-900">{date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={24} weight="duotone" className="text-color2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{t('ticket.time')}</p>
                      <p className="font-bold text-lg text-gray-900">{departureTime} - {arrivalTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bus size={24} weight="duotone" className="text-color2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{t('ticket.bus')}</p>
                      <p className="font-bold text-lg text-gray-900">{ticket.busName}</p>
                      <p className="text-sm text-gray-600">
                        {t('ticket.seat')}: <span className="font-bold text-color2">{selectedSeat}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CurrencyDollar size={24} weight="duotone" className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{t('booking.price')}</p>
                      <p className="font-bold text-2xl text-green-600">{ticket.price.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Passenger & QR Code */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-color2 pb-2">
                  Passenger Information
                </h3>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={20} weight="duotone" className="text-color2" />
                    <div>
                      <p className="text-xs text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">
                        {passengerInfo.civility} {passengerInfo.firstName} {passengerInfo.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-600">Profession</p>
                      <p className="font-semibold text-gray-900">{passengerInfo.profession}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Gender</p>
                      <p className="font-semibold text-gray-900">{passengerInfo.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Marital Status</p>
                      <p className="font-semibold text-gray-900">{passengerInfo.maritalStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">CNI</p>
                      <p className="font-semibold text-gray-900">{passengerInfo.cniKit}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{passengerInfo.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900 text-sm break-all">{passengerInfo.email}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white border-4 border-dashed border-color2 rounded-xl p-6 text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Ticket QR Code</p>
                  <div className="flex justify-center">
                    <QRCode 
                      value={ticketNumber} 
                      size={180}
                      level="H"
                      includeMargin={true}
                      renderAs="svg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{t('ticket.scanQR')}</p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please review all information carefully. After payment, you will receive this ticket via email and can download the PDF version.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                ← {t('common.back')}
              </button>
              
              <button
                onClick={handleProceedToPayment}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <CheckCircle size={24} weight="fill" />
                Proceed to Payment ({ticket.price.toLocaleString()} FCFA)
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-color2 text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <p>Click "Proceed to Payment" to complete your reservation</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-color2 text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <p>Make payment using your preferred method</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-color2 text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <p>Receive confirmation email with your ticket and QR code</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-color2 text-white flex items-center justify-center flex-shrink-0 font-bold">4</div>
              <p>Download your PDF ticket from your dashboard or email</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-color2 text-white flex items-center justify-center flex-shrink-0 font-bold">5</div>
              <p>Present your ticket (digital or printed) at the bus station</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreview;
