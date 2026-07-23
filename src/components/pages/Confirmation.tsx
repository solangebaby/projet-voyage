import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import SeatSelector from '../SeatSelector';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Bus, Calendar, CurrencyDollar } from '@phosphor-icons/react';
import bgImage from "../../assets/HeroVector.png";

const Confirmation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const trip = location.state?.trip;

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    cni: '',
  });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!trip) navigate('/');
    window.scrollTo(0, 0);
  }, [trip, navigate]);

  if (!trip) return null;

  const handleSeatSelect = (seat: string) => {
    if (trip.occupied_seats?.includes(seat)) {
      toast.error(t('errors.seatTaken'));
      return;
    }
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const isFormValid = () =>
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.cni.trim() !== '' &&
    form.gender !== '';

  const goToStep2 = () => {
    if (selectedSeats.length === 0) {
      toast.error(t('booking.selectSeat'));
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const goToStep3 = () => {
    if (isFormValid()) { setStep(3); window.scrollTo(0, 0); }
    else toast.error(t('errors.requiredField'));
  };

  const handleSubmit = () => {
    navigate('/payment', {
      state: {
        trip,
        selectedSeat: selectedSeats.join(', '),
        selectedSeats,
        passenger: { ...form, first_name: form.firstName, last_name: form.lastName },
      },
    });
  };

  const totalPrice = Number(trip.price) * selectedSeats.length;

  const formatDate = (d: string | undefined) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const stepLabels = [
    { icon: <Bus size={16} weight="duotone" />, label: t('booking.selectSeat') },
    { icon: <ArrowRight size={16} weight="bold" />, label: t('booking.passenger') },
    { icon: <CurrencyDollar size={16} weight="duotone" />, label: t('payment.summary') },
  ];

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-white relative overflow-hidden">
      <img
        className="h-[70%] w-[50%] lg:h-[85%] lg:w-[45%] absolute right-0 top-0 -z-10 object-cover opacity-40"
        src={bgImage} alt="bg"
      />
      <div className="absolute top-0 left-0 w-full h-[700px] -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-color1/10 via-white to-transparent" />
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-color2/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-color1/10 rounded-full blur-[100px]" />
      </div>

      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 py-3' : 'bg-transparent py-6'
      }`}>
        <div className="px-6 lg:px-12 max-w-7xl mx-auto"><NavBar /></div>
      </header>

      <main className="flex-1 pt-32 pb-20 px-6 lg:px-12 max-w-5xl mx-auto w-full relative z-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-color2 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
          {t('common.back')}
        </button>

        {/* Bandeau trip info */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-xl p-4 mb-8 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 px-2">
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('results.departure')}</p>
              <p className="text-base font-black text-color3">{trip.departure?.city_name}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-color2 flex items-center justify-center text-white shadow-lg">
              <ArrowRight size={14} weight="bold" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('results.arrival')}</p>
              <p className="text-base font-black text-color3">{trip.destination?.city_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl border border-white">
            <Calendar size={14} className="text-color1" weight="duotone" />
            <span className="text-xs font-bold text-color3 uppercase">{formatDate(trip.departure_date)}</span>
          </div>
          <div className="flex items-center gap-2 bg-color2/10 px-4 py-2 rounded-xl">
            <Bus size={14} className="text-color2" weight="duotone" />
            <span className="text-xs font-black text-color2 uppercase">
              {trip.agency_data?.agency_name || trip.agency?.agency_name || '—'}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-white/60 px-6 py-4 mb-10">
          <div className="flex items-center justify-center gap-0">
            {stepLabels.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 border-2 ${
                    step > i + 1
                      ? 'bg-color2 text-white border-transparent shadow-md'
                      : step === i + 1
                      ? 'bg-color2 text-white border-transparent scale-110 shadow-lg shadow-color2/30'
                      : 'bg-white text-gray-300 border-gray-100'
                  }`}>
                    {step > i + 1 ? '✓' : s.icon}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 text-center transition-all ${
                    step === i + 1 ? 'text-color2' : 'text-gray-300'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-12 sm:w-20 h-1 rounded-full mx-1 mb-4 transition-all duration-700 ${
                    step > i + 1 ? 'bg-color2' : 'bg-gray-100'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-white w-full lg:max-w-sm system-theme-selector">
              <h2 className="text-2xl font-black text-color3 uppercase italic mb-6 tracking-tighter text-center">
                {t('booking.selectSeat')}
              </h2>
              <SeatSelector
                totalSeats={trip.bus?.total_seats || 32}
                occupiedSeats={trip.occupied_seats || []}
                selectedSeat={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            </div>

            <div className="w-full lg:max-w-xs lg:sticky lg:top-40">
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-white">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                  {t('booking.seats')} {t('booking.selected')}
                </h3>

                {selectedSeats.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-2 text-gray-300">
                    <Bus size={32} weight="thin" />
                    <p className="text-xs font-bold text-center">{t('booking.selectSeat')}</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedSeats.map(seat => (
                      <span
                        key={seat}
                        onClick={() => handleSeatSelect(seat)}
                        className="bg-color2 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer hover:bg-red-400 transition-colors"
                        title="Cliquer pour désélectionner"
                      >
                        {seat} ×
                      </span>
                    ))}
                  </div>
                )}

                {selectedSeats.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('common.total')}</p>
                    <p className="text-3xl font-black text-color3">
                      {totalPrice.toLocaleString()}
                      <span className="text-xs text-gray-400 ml-1">{t('common.fcfa')}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {selectedSeats.length} × {Number(trip.price).toLocaleString()} {t('common.fcfa')}
                    </p>
                  </div>
                )}

                <button
                  onClick={goToStep2}
                  disabled={selectedSeats.length === 0}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                    selectedSeats.length > 0
                      ? 'bg-color2 text-white shadow-xl shadow-color2/30 hover:bg-color3'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {t('common.next')} <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-50">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-color3 italic uppercase tracking-tighter">
                  {t('booking.passenger')}
                </h2>
                <div className="flex gap-2 flex-wrap justify-end">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="bg-color2 text-white px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                      {t('booking.seat')} {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {[
                  { label: t('booking.firstName'), key: 'firstName' },
                  { label: t('booking.lastName'), key: 'lastName' },
                  { label: t('booking.phone'), key: 'phone' },
                  { label: t('booking.cni'), key: 'cni' },
                ].map((f) => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-3">{f.label}</label>
                    <input
                      type="text"
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-bold text-color3"
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-3">{t('booking.gender')}</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-color2/30 focus:bg-white transition-all font-bold text-color3 appearance-none cursor-pointer"
                  >
                    <option value="">—</option>
                    <option value="M">{t('booking.male')}</option>
                    <option value="F">{t('booking.female')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-color2 transition-colors group"
                >
                  <ArrowLeft size={14} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                  {t('common.back')}
                </button>
                <button
                  onClick={goToStep3}
                  className="flex-1 flex items-center justify-center gap-3 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-color2/20 bg-color2 hover:bg-color3 transition-all"
                >
                  {t('common.next')} <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-color3 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 bg-color2" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-10 bg-color1" />

              <h2 className="text-2xl font-black italic mb-8 border-b border-white/10 pb-4 uppercase tracking-tighter text-color2">
                {t('payment.summary')}
              </h2>

              <div className="space-y-5 relative z-10 text-left">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('booking.passenger')}</p>
                    <p className="font-bold text-lg">{form.firstName} {form.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('booking.seats')}</p>
                    <p className="font-black text-lg text-color2">{selectedSeats.join(', ')}</p>
                  </div>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('results.departure')}</p>
                    <p className="font-bold">{trip.departure?.city_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('results.arrival')}</p>
                    <p className="font-bold">{trip.destination?.city_name}</p>
                  </div>
                </div>

                <div className="border-b border-white/5 pb-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('booking.seats')}</p>
                  <p className="font-bold">
                    {selectedSeats.length} × {Number(trip.price).toLocaleString()} {t('common.fcfa')}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">{t('common.total')}</p>
                  <p className="text-5xl font-black tracking-tighter text-white">
                    {totalPrice.toLocaleString()}
                    <span className="text-sm text-white/40 ml-1">{t('common.fcfa')}</span>
                  </p>
                </div>

                {/* ✅ Boutons en colonne — plus de débordement */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] text-white font-black uppercase tracking-widest text-sm shadow-xl bg-color2 hover:bg-white hover:text-color3 transition-all"
                  >
                    {/* ✅ Texte hardcodé bilingue en attendant la correction des JSON */}
                    Procéder au paiement
                    <ArrowRight size={18} weight="bold" />
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center justify-center gap-2 text-white/40 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors group py-2"
                  >
                    <ArrowLeft size={14} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                    {t('common.back')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .system-theme-selector .selected,
        .system-theme-selector [data-selected="true"],
        .seat-selected {
          background-color: #FA9C0F !important;
          color: white !important;
          border-color: #FA9C0F !important;
          box-shadow: 0 4px 15px rgba(250, 156, 15, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default Confirmation;