import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import {
  Ticket, DownloadSimple, ClockClockwise, User,
  ChatCircleDots, SignOut, Calendar, MapPin, Bus, WarningCircle,
} from '@phosphor-icons/react';
import {
  getUserReservations, getUserTickets, downloadTicketPdf,
  postComment, cancelReservation, getMyDisputes, createDispute,
} from '../../services/api';

interface TripInfo {
  departure: { city_name: string };
  destination: { city_name: string };
  departure_time: string;
  arrival_time?: string;
  trip_date?: string;
  departure_date?: string;
  bus?: { bus_name: string };
}
interface Reservation {
  id: number;
  trip: TripInfo;
  selected_seat?: string;
  seat_number?: string;
  status: string;
  payment_status?: string;
  created_at: string;
}
interface TicketData {
  id: number;
  ticket_number: string;
  qr_code?: string;
  reservation: Reservation;
  created_at: string;
}
interface Dispute {
  id: number;
  type: string;
  subject: string;
  status: string;
  created_at: string;
  agency?: { agency_name: string };
}

const DISPUTE_COLORS: Record<string, string> = {
  open: 'bg-red-50 text-red-600 border-red-100',
  in_review: 'bg-color1/10 text-color1 border-color1/20',
  resolved: 'bg-green-50 text-green-600 border-green-100',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
};

const TravelerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  type Tab = 'reservations' | 'tickets' | 'history' | 'profile' | 'feedback' | 'support';
  const [activeTab, setActiveTab]       = useState<Tab>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tickets, setTickets]           = useState<TicketData[]>([]);
  const [disputes, setDisputes]         = useState<Dispute[]>([]);
  const [loading, setLoading]           = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating]             = useState(5);
  const [cancelId, setCancelId]         = useState<number | null>(null);
  const [isScrolled, setIsScrolled]     = useState(false);

  const [dType, setDType]               = useState('other');
  const [dSubject, setDSubject]         = useState('');
  const [dDesc, setDDesc]               = useState('');
  const [dResId, setDResId]             = useState('');
  const [dSubmitting, setDSubmitting]   = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const [res, tix, disp] = await Promise.allSettled([
        getUserReservations(user.id),
        getUserTickets(user.id),
        getMyDisputes(),
      ]);
      if (res.status === 'fulfilled')  setReservations((res.value || []) as any);
      if (tix.status === 'fulfilled')  setTickets((tix.value || []) as any);
      if (disp.status === 'fulfilled') setDisputes((disp.value as any)?.data || disp.value || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user.id, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownload = async (num: string) => {
    try {
      const blob = await downloadTicketPdf(num);
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `ticket-${num}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('Ticket téléchargé !');
    } catch { toast.error('Erreur téléchargement'); }
  };

  const handleShare = (num: string) => {
    const url = `${window.location.origin}/ticket?number=${num}`;
    if (navigator.share) {
      navigator.share({ title: 'Mon ticket Jadoo', url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelReservation(id);
      toast.success('Réservation annulée');
      setCancelId(null);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Impossible d\'annuler');
      setCancelId(null);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackText.trim()) { toast.error('Veuillez saisir un commentaire'); return; }
    try {
      await postComment({ comment: feedbackText, rating });
      toast.success('Avis soumis !');
      setFeedbackText(''); setRating(5);
    } catch { toast.error('Erreur soumission'); }
  };

  const handleDisputeSubmit = async () => {
    if (!dSubject.trim() || !dDesc.trim()) { toast.error('Sujet et description requis'); return; }
    setDSubmitting(true);
    try {
      await createDispute({
        type: dType, subject: dSubject, description: dDesc,
        reservation_id: dResId ? Number(dResId) : undefined,
      });
      toast.success('Réclamation soumise !');
      setShowDisputeForm(false); setDSubject(''); setDDesc(''); setDResId(''); setDType('other');
      fetchData();
    } catch { toast.error('Erreur soumission'); }
    finally { setDSubmitting(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    toast.success('Déconnexion réussie'); navigate('/login');
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-50 text-green-600 border-green-100',
      pending:   'bg-color1/10 text-color1 border-color1/20',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
      paid:      'bg-green-50 text-green-600 border-green-100',
    };
    const labels: Record<string, string> = {
      confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé', paid: 'Payé',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[s] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
        {labels[s] || s}
      </span>
    );
  };

  const TABS = [
    { key: 'reservations', label: t('dashboard.user.myReservations'),     icon: Calendar },
    { key: 'tickets',      label: t('dashboard.user.myTickets'),           icon: Ticket },
    { key: 'history',      label: t('dashboard.user.reservationHistory'),  icon: ClockClockwise },
    { key: 'profile',      label: t('dashboard.user.profile'),             icon: User },
    { key: 'feedback',     label: t('dashboard.user.giveFeedback'),        icon: ChatCircleDots },
    { key: 'support',      label: 'Support & Litiges',                     icon: WarningCircle },
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── LOADING ──
  if (loading) return (
    <div className="min-h-screen flex flex-col font-poppins bg-white">
      <NavBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-color1/20 border-t-color1 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">{t('common.loading')}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-poppins relative bg-white overflow-x-hidden">

      {/* Fond décoratif */}
      <div className="absolute top-0 left-0 w-full h-[700px] overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-color1/20 via-white to-transparent" />
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-color2/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-color1/10 rounded-full blur-[100px]" />
      </div>

      {/* Header fixe */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 py-3' : 'bg-transparent py-6'
      }`}>
        <div className="px-6 lg:px-12 max-w-7xl mx-auto"><NavBar /></div>
      </header>

      <main className="flex-1 pt-40 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10">

        {/* Bandeau profil */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-xl p-6 mb-10 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-color3 flex items-center justify-center text-white shadow-lg">
              <User size={28} weight="duotone" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('common.welcome')}</p>
              <p className="text-xl font-black text-color3 tracking-tight">{user.first_name || user.name}</p>
              <p className="text-xs text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white/80 border border-white text-color3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-color2 hover:text-white transition-all">
              {t('nav.home')}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-color3 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all">
              <SignOut size={16} weight="bold" /> {t('common.logout')}
            </button>
          </div>
        </div>

        {/* Tabs sticky */}
        <div className="sticky top-28 z-40 mb-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/60 px-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max mx-auto justify-center">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as Tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-color2 text-white shadow-lg shadow-color2/30 scale-105'
                      : 'text-gray-400 hover:text-color3 hover:bg-white/80'
                  }`}>
                  <tab.icon size={15} weight={activeTab === tab.key ? 'fill' : 'duotone'} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RÉSERVATIONS ── */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-4xl font-black text-color3 tracking-tighter">{t('dashboard.user.myReservations')}</h2>
              <button onClick={() => navigate('/')} className="flex items-center gap-2 px-6 py-3 bg-color2 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-color3 transition-all shadow-lg shadow-color2/20">
                {t('dashboard.user.bookNow')}
              </button>
            </div>
            {reservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white">
                <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-6 border border-white">
                  <Calendar size={40} weight="thin" className="text-gray-300" />
                </div>
                <p className="text-color3 font-black text-xl mb-2">{t('dashboard.user.noReservations')}</p>
                <button onClick={() => navigate('/')} className="mt-6 px-8 py-3 bg-color2 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-color3 transition-all">
                  {t('dashboard.user.bookNow')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reservations.map(r => (
                  <div key={r.id} className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm hover:shadow-2xl transition-all duration-500 flex overflow-hidden">
                    <div className="w-2 bg-color2 rounded-l-[2.5rem] flex-shrink-0" />
                    <div className="flex-1 p-7">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trajet</p>
                          <h3 className="text-lg font-black text-color3 tracking-tight">
                            {r.trip.departure.city_name}
                            <span className="text-color2 mx-2">→</span>
                            {r.trip.destination.city_name}
                          </h3>
                          {r.trip.bus?.bus_name && <p className="text-xs text-gray-400 mt-0.5">{r.trip.bus.bus_name}</p>}
                        </div>
                        {statusBadge(r.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar size={14} className="text-color2" weight="duotone" />
                          <span className="font-medium">{formatDate(r.trip.trip_date || r.trip.departure_date || r.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <MapPin size={14} className="text-color2" weight="duotone" />
                          <span className="font-medium">{r.trip.departure_time}{r.trip.arrival_time ? ` → ${r.trip.arrival_time}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Bus size={14} className="text-color2" weight="duotone" />
                          <span className="font-medium">Siège : {r.selected_seat || r.seat_number || '-'}</span>
                        </div>
                      </div>
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <button
                          onClick={() => setCancelId(r.id)}
                          className="w-full py-3 border-2 border-red-100 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all">
                          Annuler cette réservation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TICKETS ── */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-color3 tracking-tighter mb-2">{t('dashboard.user.myTickets')}</h2>
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white">
                <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-6 border border-white">
                  <Ticket size={40} weight="thin" className="text-gray-300" />
                </div>
                <p className="text-color3 font-black text-xl">{t('dashboard.user.noTickets')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map(tk => (
                  <div key={tk.id} className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                    {/* Header style billet */}
                    <div className="bg-color3 px-6 py-5 relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-color2/20 rounded-full blur-2xl" />
                      <p className="text-[9px] font-bold text-color1 uppercase tracking-widest mb-1">N° Ticket</p>
                      <p className="font-mono font-black text-white text-lg tracking-wider">{tk.ticket_number}</p>
                      <div className="absolute -left-3 bottom-0 w-6 h-6 bg-white rounded-full" />
                      <div className="absolute -right-3 bottom-0 w-6 h-6 bg-white rounded-full" />
                    </div>
                    <div className="border-t-2 border-dashed border-gray-100 mx-6" />
                    <div className="flex-1 px-6 py-5">
                      <p className="font-black text-color3 text-base mb-3">
                        {tk.reservation.trip.departure.city_name}
                        <span className="text-color2 mx-2">→</span>
                        {tk.reservation.trip.destination.city_name}
                      </p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-color2" weight="duotone" />
                          <span>{formatDate(tk.reservation.trip.trip_date || tk.reservation.trip.departure_date || tk.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bus size={12} className="text-color2" weight="duotone" />
                          <span>Siège : {tk.reservation.selected_seat || tk.reservation.seat_number || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                      <button
                        onClick={() => handleDownload(tk.ticket_number)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-color2 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-color3 transition-all shadow-lg shadow-color2/20">
                        <DownloadSimple size={14} weight="bold" /> PDF
                      </button>
                      <button
                        onClick={() => handleShare(tk.ticket_number)}
                        className="flex-1 py-3 border-2 border-color2/20 text-color2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-color2/5 transition-all">
                        Partager
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORIQUE ── */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-4xl font-black text-color3 tracking-tighter mb-8">{t('dashboard.user.reservationHistory')}</h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {['Trajet', 'Date', 'Siège', 'Statut', 'Créé le'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.map(r => (
                      <tr key={r.id} className="hover:bg-color1/5 transition-colors">
                        <td className="px-6 py-4 font-black text-color3 text-sm">
                          {r.trip.departure.city_name} <span className="text-color2">→</span> {r.trip.destination.city_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(r.trip.trip_date || r.trip.departure_date || r.created_at)}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-bold">{r.selected_seat || r.seat_number || '-'}</td>
                        <td className="px-6 py-4">{statusBadge(r.status)}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFIL ── */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-4xl font-black text-color3 tracking-tighter mb-8">{t('dashboard.user.profile')}</h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm p-8 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Nom',       value: user.name },
                  { label: 'Prénom',    value: user.first_name },
                  { label: 'Email',     value: user.email },
                  { label: 'Téléphone', value: user.phone || 'Non renseigné' },
                  { label: 'Rôle',      value: user.role },
                  { label: 'Statut',    value: user.status },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">{f.label}</label>
                    <div className="bg-gray-50 rounded-2xl px-5 py-4 font-bold text-color3 text-sm border-2 border-transparent">
                      {f.value || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {activeTab === 'feedback' && (
          <div>
            <h2 className="text-4xl font-black text-color3 tracking-tighter mb-8">{t('dashboard.user.giveFeedback')}</h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm p-8 max-w-xl">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 block mb-3">Note</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setRating(s)}
                        className={`text-3xl transition-all duration-200 ${s <= rating ? 'text-color1 scale-110' : 'text-gray-300 scale-90'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 block mb-3">Votre commentaire</label>
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    rows={5}
                    placeholder="Partagez votre expérience..."
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-medium text-color3 text-sm resize-none"
                  />
                </div>
                <button
                  onClick={handleFeedback}
                  className="w-full py-4 bg-color2 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-color3 transition-all shadow-xl shadow-color2/20">
                  {t('common.submit')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUPPORT ── */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black text-color3 tracking-tighter">Support &amp; Litiges</h2>
              <button
                onClick={() => setShowDisputeForm(s => !s)}
                className="flex items-center gap-2 px-6 py-3 bg-color2 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-color3 transition-all shadow-lg shadow-color2/20">
                {showDisputeForm ? 'Masquer le formulaire' : '+ Nouvelle réclamation'}
              </button>
            </div>

            {/* Formulaire réclamation */}
            {showDisputeForm && (
              <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm p-8">
                <h3 className="text-lg font-black text-color3 uppercase tracking-tight mb-6">Soumettre une réclamation</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Type de problème</label>
                      <select value={dType} onChange={e => setDType(e.target.value)}
                        className="bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-bold text-color3 text-sm">
                        {['cancellation', 'delay', 'overcharge', 'quality', 'lost_luggage', 'other'].map(v => (
                          <option key={v} value={v}>{t(`support.types.${v}`)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Réservation concernée (optionnel)</label>
                      <select value={dResId} onChange={e => setDResId(e.target.value)}
                        className="bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-bold text-color3 text-sm">
                        <option value="">-- Sélectionner --</option>
                        {reservations.map(r => (
                          <option key={r.id} value={r.id}>#{r.id} — {r.trip.departure.city_name} → {r.trip.destination.city_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Sujet *</label>
                    <input value={dSubject} onChange={e => setDSubject(e.target.value)}
                      placeholder="Résumé du problème..."
                      className="bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-bold text-color3 text-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description détaillée *</label>
                    <textarea value={dDesc} onChange={e => setDDesc(e.target.value)} rows={4}
                      placeholder="Décrivez votre problème en détail..."
                      className="bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-bold text-color3 text-sm resize-none" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setShowDisputeForm(false)}
                      className="px-6 py-3 border-2 border-gray-100 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-gray-200 transition-all">
                      Annuler
                    </button>
                    <button disabled={dSubmitting} onClick={handleDisputeSubmit}
                      className="flex-1 py-3 bg-color2 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-color3 transition-all shadow-lg shadow-color2/20 disabled:opacity-50">
                      {dSubmitting ? 'Envoi...' : 'Soumettre la réclamation'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste réclamations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50">
                <h3 className="font-black text-color3 uppercase tracking-tight text-sm">
                  Mes réclamations <span className="text-color2">({disputes.length})</span>
                </h3>
              </div>
              {disputes.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <WarningCircle size={48} weight="thin" className="text-gray-200" />
                  <p className="text-sm font-bold text-gray-400">Aucune réclamation pour l'instant</p>
                  <p className="text-xs text-gray-300">Utilisez le bouton ci-dessus pour signaler un problème</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {disputes.map(d => (
                    <div key={d.id} className="px-8 py-5 flex items-center justify-between hover:bg-color1/5 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-gray-300 font-bold">#{d.id}</span>
                          <span className="bg-color2/10 text-color2 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                            {t(`support.types.${d.type}`) || d.type}
                          </span>
                        </div>
                        <p className="font-black text-color3 text-sm">{d.subject}</p>
                        {d.agency && <p className="text-xs text-gray-400 mt-0.5">Agence : {d.agency.agency_name}</p>}
                        <p className="text-[10px] text-gray-300 mt-1">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${DISPUTE_COLORS[d.status] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {t(`support.statuses.${d.status}`) || d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact support */}
            <div className="bg-color3 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-color2/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="font-black text-white text-lg uppercase tracking-tight mb-2">Contacter le support</h3>
                <p className="text-white/50 text-sm mb-5">Pour toute urgence, contactez-nous directement :</p>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:support@jadootravels.com"
                    className="px-6 py-3 bg-color2 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-color3 transition-all shadow-lg">
                    ✉ Email support
                  </a>
                  <a href="tel:+237000000000"
                    className="px-6 py-3 border-2 border-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    📞 Appeler
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Modal confirmation annulation */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-white/60">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
              <WarningCircle size={28} weight="duotone" className="text-red-400" />
            </div>
            <h3 className="font-black text-xl text-color3 mb-2 tracking-tight">Annuler la réservation ?</h3>
            <p className="text-sm text-gray-400 mb-8 font-medium">Cette action est irréversible selon les conditions de l'agence.</p>
            <div className="flex gap-4">
              <button onClick={() => setCancelId(null)}
                className="flex-1 py-3 border-2 border-gray-100 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-gray-200 transition-all">
                Non, garder
              </button>
              <button onClick={() => handleCancel(cancelId)}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg">
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerDashboard;