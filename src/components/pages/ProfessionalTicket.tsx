import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import apiClient, { getTicketByNumber, authService } from '../../services/api';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import toast from 'react-hot-toast';
import bgImage from '../../assets/HeroVector.png';
import { ArrowLeft, ArrowRight, Download, Printer, House } from '@phosphor-icons/react';

const FRONTEND_URL = window.location.origin;

const ProfessionalTicket = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    tickets: ticketsFromState,
    reservations,
    trip: tripFromState,
    selectedSeats,
    selectedSeat,
    passenger,
    paymentMethod,
    ticketNumber: tnFromState,
    reservationId,
  } = location.state || {};

  const [ticketsData, setTicketsData] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState(0);
  const [isScrolled, setIsScrolled]   = useState(false);

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountCreated, setAccountCreated]   = useState(false);
  const [isLoggedIn, setIsLoggedIn]           = useState(authService.isAuthenticated());
  const [accountEmail, setAccountEmail]       = useState(passenger?.email || '');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountConfirm, setAccountConfirm]   = useState('');
  const [activating, setActivating]           = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // ✅ Cas multi-tickets (nouveau flow bulk)
        if (ticketsFromState?.length > 0) {
          const mapped = ticketsFromState.map((tk: any, i: number) => ({
            ...tk,
            _seat:          selectedSeats?.[i] || tk.reservation?.selected_seat,
            _trip:          tripFromState,
            _passenger:     passenger,
            _paymentMethod: paymentMethod,
          }));
          console.log('tickets mappés:', mapped.length);
          setTicketsData(mapped);
        }
        // Cas ticket unique via numéro (deeplink)
        else if (tnFromState) {
          const data = await getTicketByNumber(tnFromState);
          setTicketsData([{
            ...data,
            _seat:      selectedSeat,
            _trip:      tripFromState,
            _passenger: passenger,
          }]);
        }
        // Fallback
        else {
          setTicketsData([{
            ticket_number: `TKT-${reservationId}`,
            status:        'valid',
            ticket_type:   'standard',
            _seat:         selectedSeat,
            _trip:         tripFromState,
            _passenger:    passenger,
            reservation: {
              id:            reservationId,
              selected_seat: selectedSeat,
              trip:          tripFromState,
            },
          }]);
        }
      } catch {
        toast.error(t('errors.generic'));
      } finally {
        setLoading(false);
        if (!authService.isAuthenticated()) {
          setTimeout(() => setShowAccountForm(true), 800);
        }
      }
    };
    load();
  }, []);

  const handleDownload = async (index: number) => {
    const ref = ticketRefs.current[index];
    if (!ref) return;
    const toastId = toast.loading(t('ticket.generating'));
    try {
      const canvas = await html2canvas(ref, { scale: 2, useCORS: true });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticketsData[index]?.ticket_number}.png`;
      a.click();
      const tn = ticketsData[index]?.ticket_number;
      if (tn) await apiClient.post(`/tickets/${tn}/download`).catch(() => {});
      toast.success(t('ticket.downloaded'), { id: toastId });
    } catch {
      toast.error(t('errors.generic'), { id: toastId });
    }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < ticketsData.length; i++) {
      await handleDownload(i);
    }
  };

  const handleCreateAccount = async () => {
    if (!accountEmail || !accountPassword) return toast.error(t('errors.requiredField'));
    if (accountPassword.length < 6) return toast.error(t('auth.passwordMin'));
    if (accountPassword !== accountConfirm) return toast.error(t('auth.passwordMismatch'));
    const currentResId = reservations?.[0]?.id || reservationId;
    if (!currentResId) return toast.error(t('errors.generic'));
    setActivating(true);
    try {
      const response = await apiClient.post('/auth/setup-account', {
        email:                 accountEmail,
        password:              accountPassword,
        password_confirmation: accountConfirm,
        reservation_id:        currentResId,
        passenger_first_name:  passenger?.first_name,
        passenger_last_name:   passenger?.last_name,
        passenger_phone:       passenger?.phone,
      });
      const { token, user, success } = response.data;
      if (success && token) {
        authService.setToken(token);
        authService.setUser(user);
        setIsLoggedIn(true);
        setAccountCreated(true);
        setShowAccountForm(false);
        toast.success(t('auth.accountActivated'));
        navigate(location.pathname, { replace: true, state: { ...location.state } });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('errors.generic'));
    } finally {
      setActivating(false);
    }
  };

  const formatTime = (s: string) => s?.slice(0, 5) || '';
  const formatDate = (d: any) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="fixed top-0 left-0 w-full z-50 bg-transparent py-6">
          <div className="px-6 lg:px-12 max-w-7xl mx-auto"><NavBar /></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-color2/20 border-t-color2 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-color3 font-black text-xs uppercase tracking-widest">{t('ticket.generating')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-white relative overflow-hidden">
      <img
        className="h-[70%] w-[50%] lg:h-[85%] lg:w-[45%] absolute right-0 top-0 -z-10 object-cover opacity-40"
        src={bgImage} alt="bg"
      />
      <div className="absolute top-0 left-0 w-full h-[700px] -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-color1/10 via-white to-transparent" />
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-color2/5 rounded-full blur-[120px]" />
      </div>

      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 py-3' : 'bg-transparent py-6'
      }`}>
        <div className="px-6 lg:px-12 max-w-7xl mx-auto"><NavBar /></div>
      </header>

      <main className="flex-1 pt-32 pb-20 px-6 lg:px-12 max-w-4xl mx-auto w-full relative z-10">

        {/* Retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-color2 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
          {t('common.back')}
        </button>

        {/* Titre + actions globales */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-color3 uppercase italic tracking-tighter">
              {ticketsData.length > 1
                ? `${ticketsData.length} ${t('ticket.tickets')}`
                : t('ticket.title')}
            </h1>
            {ticketsData.length > 1 && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                {t('ticket.multipleSeats')} : {selectedSeats?.join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            {ticketsData.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-5 py-2.5 bg-color2 hover:bg-color3 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-color2/20"
              >
                <Download size={16} weight="bold" />
                {t('ticket.downloadAll')}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-500 hover:border-color2 hover:text-color2 font-black rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              <Printer size={16} weight="bold" />
              {t('common.print')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-color3 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-color2 transition-all"
            >
              <House size={16} weight="bold" />
              {t('nav.home')}
            </button>
          </div>
        </div>

        {/* Formulaire compte */}
        {showAccountForm && !accountCreated && !isLoggedIn && (
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 mb-8 border-t-4 border-color2">
            <h3 className="text-xl font-black text-color3 uppercase tracking-tighter mb-1">{t('ticket.saveAccount')}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{t('ticket.saveAccountDesc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{t('common.email')}</label>
                <input
                  type="email" value={accountEmail}
                  onChange={e => setAccountEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold text-color3 outline-none focus:border-color2/30 transition-all"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{t('auth.password')}</label>
                <input
                  type="password" value={accountPassword}
                  onChange={e => setAccountPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold text-color3 outline-none focus:border-color2/30 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{t('auth.confirmPassword')}</label>
                <input
                  type="password" value={accountConfirm}
                  onChange={e => setAccountConfirm(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold text-color3 outline-none focus:border-color2/30 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateAccount} disabled={activating}
                className="flex-1 py-4 bg-color2 hover:bg-color3 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all disabled:opacity-60"
              >
                {activating ? t('common.loading') : t('auth.activateAccount')}
              </button>
              <button
                onClick={() => setShowAccountForm(false)}
                className="px-6 py-4 border-2 border-gray-100 text-gray-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:border-color2 hover:text-color2 transition-all"
              >
                {t('confirmation.later')}
              </button>
            </div>
          </div>
        )}

        {/* Onglets navigation — scroll vers le ticket */}
        {ticketsData.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 sticky top-20 z-30 bg-white/80 backdrop-blur-md py-3 rounded-2xl px-2">
            {ticketsData.map((tk, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveTab(i);
                  document.getElementById(`ticket-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`shrink-0 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === i
                    ? 'bg-color2 text-white shadow-lg shadow-color2/20'
                    : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-color2 hover:text-color2'
                }`}
              >
                {t('booking.seat')} {tk._seat}
              </button>
            ))}
          </div>
        )}

        {/* ✅ TOUS les tickets affichés — pas de filtre */}
        {ticketsData.map((ticketItem, index) => {
          const trip      = ticketItem._trip || ticketItem.reservation?.trip || {};
          const pax       = ticketItem._passenger || passenger || {};
          const seatNum   = ticketItem._seat || ticketItem.reservation?.selected_seat || '';
          const ticketNum = ticketItem.ticket_number || '';
          const scanUrl   = `${FRONTEND_URL}/scan/${ticketNum}`;
          const resId     = ticketItem.reservation?.id || reservations?.[index]?.id || '';
          const agencyName = trip.departureAgency?.agency_name || trip.agency?.agency_name || '—';

          return (
            <div key={index} id={`ticket-${index}`} className="mb-12 scroll-mt-32">

              {/* Label + action par ticket */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {ticketsData.length > 1 && (
                    <span className="text-color2 mr-2">
                      {t('ticket.ticket')} {index + 1}/{ticketsData.length}
                    </span>
                  )}
                  {t('booking.seat')} <span className="text-color2">{seatNum}</span>
                </p>
                <button
                  onClick={() => handleDownload(index)}
                  className="flex items-center gap-2 px-4 py-2 bg-color2/10 hover:bg-color2 text-color2 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                >
                  <Download size={14} weight="bold" />
                  {t('common.download')}
                </button>
              </div>

              {/* Ticket visuel */}
              <div
                ref={el => { ticketRefs.current[index] = el; }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xl"
              >
                {/* Header */}
                <div className="bg-color3 px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">
                      Marketplace Transport Cameroun
                    </p>
                    <h1 className="text-white text-2xl font-black uppercase">{t('ticket.title')}</h1>
                    <p className="text-white/80 text-sm mt-1">{agencyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold">{t('ticket.ticketNumber')}</p>
                    <p className="text-white font-black text-lg tracking-wider font-mono">{ticketNum}</p>
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                      ticketItem?.status === 'valid' ? 'bg-color2 text-white' :
                      ticketItem?.status === 'used'  ? 'bg-gray-300 text-gray-700' :
                      'bg-red-400 text-white'
                    }`}>
                      {ticketItem?.status === 'valid'
                        ? t('ticket.validTicket')
                        : ticketItem?.status || t('ticket.validTicket')}
                    </span>
                  </div>
                </div>

                {/* Bandeau trajet */}
                <div className="bg-color2 px-6 py-4 flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-xs opacity-80 uppercase tracking-widest font-bold">{t('results.departure')}</p>
                    <p className="text-xl font-black">{trip.departure?.city_name || '—'}</p>
                    <p className="text-sm font-semibold opacity-90">{formatTime(trip.departure_time)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight size={28} className="text-white/70" weight="bold" />
                    <p className="text-white/70 text-xs font-bold">{formatDate(trip.departure_date)}</p>
                  </div>
                  <div className="text-white text-right">
                    <p className="text-xs opacity-80 uppercase tracking-widest font-bold">{t('results.arrival')}</p>
                    <p className="text-xl font-black">{trip.destination?.city_name || '—'}</p>
                    <p className="text-sm font-semibold opacity-90">{formatTime(trip.arrival_time)}</p>
                  </div>
                </div>

                {/* Corps */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-2">{t('booking.passenger')}</p>
                      <p className="text-2xl font-black text-color3">{pax.first_name} {pax.last_name}</p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('booking.gender')}</p>
                          <p className="font-semibold text-color3">
                            {pax.gender === 'M' ? t('booking.male') : pax.gender === 'F' ? t('booking.female') : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('booking.cni')}</p>
                          <p className="font-semibold text-color3">{pax.cni || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('common.phone')}</p>
                          <p className="font-semibold text-color3">{pax.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('common.email')}</p>
                          <p className="font-semibold text-color3 truncate">{pax.email || '—'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-2">{t('ticket.trip')}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('results.bus')}</p>
                          <p className="font-semibold text-color3">{trip.bus?.bus_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('booking.seat')}</p>
                          <p className="font-black text-color2 text-lg">{seatNum || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('results.agency')}</p>
                          <p className="font-semibold text-color3">{agencyName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('common.price')}</p>
                          <p className="font-black text-color2">{Number(trip.price || 0).toLocaleString()} {t('common.fcfa')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('confirmation.reservationId')}</p>
                          <p className="font-semibold text-color3">#{resId || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">{t('common.type')}</p>
                          <p className="font-semibold text-color3">
                            {ticketItem?.ticket_type === 'vip' ? 'VIP' : 'Standard'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <QRCodeCanvas value={scanUrl} size={130} level="H" includeMargin fgColor="#152F37" />
                    <p className="text-xs text-gray-400 text-center mt-2 uppercase tracking-widest font-bold">
                      {t('ticket.scanQR')}
                    </p>
                    <p className="text-xs font-mono text-color2 mt-1 break-all text-center font-bold">{ticketNum}</p>
                  </div>
                </div>

                {/* Footer ticket */}
                <div className="bg-color3 px-6 py-3 flex items-center justify-between text-xs text-white/60">
                  <span className="uppercase tracking-widest font-bold">
                    Marketplace Transport Cameroun © {new Date().getFullYear()}
                  </span>
                  <span className="font-mono text-white/80 font-bold">{ticketNum}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
};

export default ProfessionalTicket;