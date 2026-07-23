import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/api';

const TicketScan = () => {
  const { t } = useTranslation();
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/tickets/${ticketNumber}/scan`);
        setData(res.data.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (ticketNumber) load();
  }, [ticketNumber]);

  const formatDate = (d: any) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  const formatTime = (t: string) => t?.slice(0, 5) || '—';
  const formatDateTime = (d: any) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR');
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'valid':     return { color: 'bg-green-500',  text: t('scan.valid'),     icon: '✓' };
      case 'used':      return { color: 'bg-gray-500',   text: t('scan.used'),      icon: '✗' };
      case 'cancelled': return { color: 'bg-red-500',    text: t('scan.cancelled'), icon: '✗' };
      default:          return { color: 'bg-yellow-500', text: status,              icon: '?' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('scan.loading')}</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-strong p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('scan.notFound')}</h2>
          <p className="text-gray-500 mb-6">{t('scan.notFoundDesc')}</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition">
            {t('ticket.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig(data?.ticket_status || 'valid');
  const pax = data?.passenger || {};
  const trip = data?.trip || {};
  const payment = data?.payment || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-color3 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {t('scan.securedPage')}
          </div>
          <h1 className="text-3xl font-black text-color3">{t('scan.title')}</h1>
          <p className="text-gray-500 mt-1">{t('scan.poweredBy')}</p>
        </div>

        {/* Status badge */}
        <div className={`${status.color} text-white rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-strong`}>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl font-black">
            {status.icon}
          </div>
          <div>
            <p className="text-sm font-medium opacity-80">{t('scan.ticketNumber')}</p>
            <p className="text-xl font-black tracking-wider">{data?.ticket_number}</p>
            <p className="text-lg font-bold mt-1">{status.text}</p>
          </div>
        </div>

        {/* Passenger */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('scan.passengerInfo')}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">{t('scan.firstName')}</p><p className="font-bold text-color3">{pax.first_name || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.lastName')}</p><p className="font-bold text-color3">{pax.last_name || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.gender')}</p><p className="font-semibold">{pax.gender === 'M' ? t('scan.male') : pax.gender === 'F' ? t('scan.female') : '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.nationality')}</p><p className="font-semibold">{pax.nationality || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.cni')}</p><p className="font-semibold">{pax.cni || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.phone')}</p><p className="font-semibold">{pax.phone || '—'}</p></div>
          </div>
        </div>

        {/* Trip info */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {t('scan.tripInfo')}
          </h3>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">{t('scan.departure')}</p>
              <p className="font-black text-color3 text-lg">{trip.departure_city || '—'}</p>
              <p className="text-primary-500 font-bold text-sm">{formatTime(trip.departure_time)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">{t('scan.arrival')}</p>
              <p className="font-black text-color3 text-lg">{trip.arrival_city || '—'}</p>
              <p className="text-primary-500 font-bold text-sm">{formatTime(trip.arrival_time)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">{t('scan.date')}</p><p className="font-semibold">{formatDate(trip.departure_date)}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.seat')}</p><p className="font-black text-primary-500 text-lg">{data?.reservation?.selected_seat || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.bus')}</p><p className="font-semibold">{trip.bus_name || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.agency')}</p><p className="font-semibold">{trip.agency_name || '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{t('scan.price')}</p><p className="font-bold text-primary-500">{Number(trip.price || 0).toLocaleString()} FCFA</p></div>
          </div>
        </div>

        {/* Payment */}
        {payment?.method && (
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-6 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {t('scan.paymentInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">{t('scan.paymentMethod')}</p><p className="font-bold">{payment.method}</p></div>
              <div><p className="text-gray-400 text-xs">{t('scan.paymentStatus')}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {t(`statuses.${payment.status}`) || payment.status}
                </span>
              </div>
              {payment.completed_at && (
                <div className="col-span-2"><p className="text-gray-400 text-xs">{t('scan.paidAt')}</p><p className="font-semibold">{formatDateTime(payment.completed_at)}</p></div>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-4">
          <p>Marketplace Transport Cameroun © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketScan;
