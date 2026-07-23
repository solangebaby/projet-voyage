import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchTrips, Trip } from '../../services/api';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import toast from 'react-hot-toast';
import { Bus, ArrowRight, Calendar, Clock, Tag } from "@phosphor-icons/react";

const Ticketpage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const departureId     = params.get('departure_id') || '';
  const destinationId   = params.get('destination_id') || '';
  const date            = params.get('date') || '';
  const departureName   = params.get('departure_name') || '';
  const destinationName = params.get('destination_name') || '';

  const [trips, setTrips]           = useState<Trip[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!departureId || !destinationId) {
        setLoading(false);
        setError(t('results.noResults'));
        return;
      }
      setLoading(true);
      setError('');
      try {
        const results = await searchTrips({
          departure:   departureId,
          destination: destinationId,
          date,
        });
        setTrips(results);
      } catch (err: any) {
        console.error('ERREUR fetchTrips:', err?.response?.status, err?.response?.data, err?.message);
        setError(t('results.error'));
        toast.error(t('results.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [departureId, destinationId, date, t]);

  const handleSelect = (trip: Trip) => {
    navigate('/confirmation', { state: { trip } });
  };

  const formatTime = (t: string | undefined) => t?.slice(0, 5) || '';
  const formatDate = (d: string | undefined) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  const calcDuration = (dep: string | undefined, arr: string | undefined) => {
    if (!dep || !arr) return '--h--';
    const [dh, dm] = dep.split(':').map(Number);
    const [ah, am] = arr.split(':').map(Number);
    let diff = (ah * 60 + am) - (dh * 60 + dm);
    if (diff < 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h${m > 0 ? (m < 10 ? '0' : '') + m : '00'}`;
  };
  const getStatusStyles = (seats: number) => {
    if (seats <= 0) return 'bg-red-50 text-red-600 border-red-100';
    if (seats <= 5) return 'bg-color1/10 text-color1 border-color1/20';
    return 'bg-green-50 text-green-600 border-green-100';
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins relative bg-white overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[700px] overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-color1/20 via-white to-transparent" />
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-color2/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-color1/10 rounded-full blur-[100px]" />
      </div>

      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 py-3' : 'bg-transparent py-6'
      }`}>
        <div className="px-6 lg:px-12 max-w-7xl mx-auto"><NavBar /></div>
      </header>

      <main className="flex-1 pt-44 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10">

        {/* Bandeau sticky */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-xl p-5 mb-16 border border-white/60 flex flex-col lg:flex-row items-center justify-between gap-6 sticky top-32 z-40">
          <div className="flex items-center gap-10 px-6">
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
                {t('results.departure')}
              </p>
              <p className="text-xl font-black text-color3 tracking-tight">{departureName}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-color2 text-white shadow-lg">
              <ArrowRight size={24} weight="bold" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
                {t('results.arrival')}
              </p>
              <p className="text-xl font-black text-color3 tracking-tight">{destinationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 px-6 py-3 rounded-2xl border border-white">
            <Calendar size={20} className="text-color1" weight="duotone" />
            <span className="text-sm font-bold text-color3 uppercase">{formatDate(date)}</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full lg:w-auto px-10 py-4 bg-color3 text-white rounded-2xl text-xs font-bold hover:bg-color2 transition-all uppercase tracking-widest">
            {t('common.back')}
          </button>
        </div>

        {/* Titre */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-color3 tracking-tighter leading-none">
            {t('results.title')}
          </h1>
          {!loading && trips.length > 0 && (
            <p className="text-gray-500 font-bold text-sm mt-4 flex items-center gap-2 px-1">
              <span className="w-3 h-3 rounded-full bg-color1 animate-ping" />
              {trips.length} {t('results.tripsFound')}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-color1/20 border-t-color1 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">{t('common.loading')}</p>
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && !error && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white">
            <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center mb-6 border border-white">
              <Bus size={48} weight="thin" className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-color3 mb-2">{t('results.noResults')}</h2>
            <p className="text-gray-500 font-medium text-center max-w-md mb-10">
              {t('results.noResultsDesc')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-10 py-4 bg-color2 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-color3 transition-all uppercase">
              {t('results.changeDate')}
            </button>
          </div>
        )}

        {/* Liste des voyages */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {trips.map((trip) => {
              // ✅ Utilise available_seats du backend en priorité
              const availableSeats = trip.available_seats ?? 
                (trip.bus?.total_seats 
                  ? trip.bus.total_seats - (trip.occupied_seats?.length || 0)
                  : 99);

              return (
                <div key={trip.id}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row overflow-hidden">

                  {/* Colonne gauche agence */}
                  <div className="md:w-1/3 bg-color3 p-8 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-color2/20 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10 text-color1">
                        <Bus size={28} weight="duotone" />
                      </div>
                      <p className="text-[10px] font-bold text-color1 uppercase tracking-widest mb-1">
                        {t('results.company')}
                      </p>
                      <h3 className="text-white font-black leading-tight break-words line-clamp-3 text-base lg:text-lg">
                        {trip.agency_data?.agency_name || trip.agency?.agency_name || trip.departureAgency?.agency_name || '—'}
                      </h3>
                    </div>
                    <div className="relative z-10">
                      <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase ${
                        trip.bus?.type === 'vip'
                          ? 'bg-gradient-to-r from-color1 to-orange-400 text-white'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}>
                        {trip.bus?.type === 'vip' ? `✨ ${t('results.vip')}` : t('results.standard')}
                      </span>
                    </div>
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full z-20" />
                  </div>

                  {/* Colonne droite détails */}
                  <div className="flex-1 p-8 flex flex-col justify-between relative">
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <p className="text-3xl font-black text-color3">{formatTime(trip.departure_time)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{trip.departure?.city_name}</p>
                      </div>
                      <div className="flex-1 px-4 flex flex-col items-center pt-3">
                        <div className="flex items-center gap-1.5 text-color1 mb-2 bg-color1/5 px-2 py-0.5 rounded-full">
                          <Clock size={12} weight="bold" />
                          <span className="text-[10px] font-black">{calcDuration(trip.departure_time, trip.arrival_time)}</span>
                        </div>
                        <div className="w-full h-[2px] border-t-2 border-dashed border-gray-100 relative">
                          <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-color2" />
                          <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-gray-200" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-color3">{formatTime(trip.arrival_time)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{trip.destination?.city_name}</p>
                      </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-end gap-6">
                      <div className="text-left w-full sm:w-auto">
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <Tag size={14} weight="fill" className="text-color2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {t('results.fare')}
                          </span>
                        </div>
                        <p className="text-4xl font-black text-color2 leading-none">
                          {Number(trip.price).toLocaleString()}
                          <span className="text-xs font-bold text-color3 ml-1">FCFA</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold ${getStatusStyles(availableSeats)}`}>
                          {availableSeats > 0
                            ? `${availableSeats} ${t('results.seatsAvailable')}`
                            : t('results.full')}
                        </div>
                        <button
                          onClick={() => handleSelect(trip)}
                          disabled={availableSeats <= 0}
                          className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs tracking-widest ${
                            availableSeats <= 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-color2 text-white hover:bg-color3 shadow-xl shadow-color2/20'
                          }`}>
                          {availableSeats <= 0 ? t('results.full') : t('results.selectTrip')}
                          <ArrowRight size={18} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Ticketpage;