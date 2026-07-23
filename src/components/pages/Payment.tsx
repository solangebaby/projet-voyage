import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient, { initiatePayment, verifyPayment, createBulkReservation } from '../../services/api';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import toast from 'react-hot-toast';
import bgImage from "../../assets/HeroVector.png";
import {
  DeviceMobile, ArrowLeft, ArrowRight, Bus, Calendar,
  ShieldCheck, CheckCircle, CurrencyDollar, Ticket
} from "@phosphor-icons/react";

type Step = 'operator' | 'phone_entry' | 'processing';

const Payment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, selectedSeat, selectedSeats, passenger } = location.state || {};

  const [step, setStep] = useState<Step>('operator');
  const [operator, setOperator] = useState<'MTN' | 'Orange' | ''>('');
  const [phone, setPhone] = useState('237');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!trip || !passenger) navigate('/');
    window.scrollTo(0, 0);
  }, [trip, passenger, navigate]);

  if (!trip) return null;

  const seats = selectedSeats?.length ? selectedSeats : [selectedSeat];
  const totalPrice = Number(trip.price) * seats.length;

  const formatDate = (d: string | undefined) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const validateOperatorPrefix = (num: string, op: 'MTN' | 'Orange') => {
    const localNum = num.startsWith('237') ? num.slice(3) : num;
    const mtnPrefixes = ['67', '68', '650', '651', '652', '653', '654'];
    const orangePrefixes = ['69', '655', '656', '657', '658', '659'];
    return op === 'MTN'
      ? mtnPrefixes.some(p => localNum.startsWith(p))
      : orangePrefixes.some(p => localNum.startsWith(p));
  };

  const handleOperatorSelect = (op: 'MTN' | 'Orange') => {
    setOperator(op);
    setStep('phone_entry');
  };

  const handleFinalPayment = async () => {
    const localNum = phone.startsWith('237') ? phone.slice(3) : phone;
    if (localNum.length < 8) {
      toast.error(t('errors.invalidPhone'));
      return;
    }
    if (operator && !validateOperatorPrefix(phone, operator)) {
      toast.error(t('payment.wrongOperator', { operator }));
      return;
    }
    setStep('processing');
    try {
      // ✅ Appel via la fonction exportée
      const bulkData = await createBulkReservation({
        trip_id:               trip.id,
        selected_seats:        seats,
        passenger_first_name:  passenger.first_name,
        passenger_last_name:   passenger.last_name,
        passenger_email:       passenger.email || `${passenger.phone}@noemail.cm`,
        passenger_phone:       passenger.phone,
        passenger_gender:      passenger.gender,
        passenger_cni:         passenger.cni,
      });

      console.log('BULK RESPONSE:', bulkData);
      console.log('NOMBRE DE TICKETS:', bulkData.tickets?.length);

      const { reservations, tickets } = bulkData;

      // Paiement lié à la première réservation pour le montant total
      const payment = await initiatePayment({
        reservation_id: reservations[0].id,
        amount:         totalPrice,
        payment_method: operator,
        phone_number:   phone,
      });

      setTimeout(async () => {
        try {
         // await verifyPayment(payment.transaction_id || payment.reference || 'SIM');
        } catch { /* on continue quand même */ }

        navigate('/ticket', {
          state: {
            tickets,
            reservations,
            trip,
            selectedSeats: seats,
            passenger,
            paymentMethod: operator,
          },
        });
      }, 4000);

    } catch (err: any) {
      setStep('phone_entry');
      toast.error(err?.response?.data?.message || t('errors.generic'));
    }
  };

  const stepLabels = [
    { icon: <Bus size={16} weight="duotone" />, label: t('booking.passenger'), done: true },
    { icon: <CurrencyDollar size={16} weight="duotone" />, label: t('payment.method'), done: step === 'processing' },
    { icon: <Ticket size={16} weight="duotone" />, label: t('common.ticket'), done: false },
  ];
  const currentStep = step === 'processing' ? 3 : 2;

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

        {/* Bouton retour */}
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
                    s.done
                      ? 'bg-color2 border-color2 text-white shadow-md'
                      : currentStep === i + 1
                      ? 'bg-color2 text-white border-transparent scale-110 shadow-lg shadow-color2/30'
                      : 'bg-white text-gray-300 border-gray-100'
                  }`}>
                    {s.done ? <CheckCircle size={18} weight="fill" /> : s.icon}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 text-center transition-all ${
                    currentStep === i + 1 ? 'text-color2' : s.done ? 'text-color2' : 'text-gray-300'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-12 sm:w-20 h-1 rounded-full mx-1 mb-4 transition-all duration-700 ${
                    s.done ? 'bg-color2' : 'bg-gray-100'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full">

            {/* Choix opérateur */}
            {step === 'operator' && (
              <div>
                <h1 className="text-4xl font-black text-color3 uppercase italic mb-3 tracking-tighter">
                  {t('payment.method')}
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">
                  {t('payment.chooseOperator')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
                  {[
                    { op: 'MTN' as const, bg: 'bg-[#FFCC00]', textColor: 'text-black', label: 'MTN MoMo', hint: '67x / 68x / 65x' },
                    { op: 'Orange' as const, bg: 'bg-[#FF6600]', textColor: 'text-white', label: 'Orange Money', hint: '69x / 65x' },
                  ].map(({ op, bg, textColor, label, hint }) => (
                    <button
                      key={op}
                      onClick={() => handleOperatorSelect(op)}
                      className="group bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-color2 transition-all flex flex-col items-center gap-4 active:scale-95"
                    >
                      <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <span className={`font-black text-lg ${textColor}`}>{op === 'MTN' ? 'MTN' : 'OM'}</span>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-xs uppercase tracking-widest text-color3">{label}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">{hint}</p>
                      </div>
                      <div className="w-full flex items-center justify-center py-2 bg-gray-50 rounded-xl group-hover:bg-color2/10 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-color2 transition-colors">
                          {t('common.select')} →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Saisie numéro */}
            {step === 'phone_entry' && (
              <div className="max-w-md">
                <button
                  onClick={() => setStep('operator')}
                  className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest mb-8 hover:text-color2 transition-colors group"
                >
                  <ArrowLeft size={14} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                  {t('common.back')}
                </button>
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-gray-50">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                      operator === 'MTN' ? 'bg-[#FFCC00]' : 'bg-[#FF6600]'
                    }`}>
                      <span className={`font-black text-sm ${operator === 'MTN' ? 'text-black' : 'text-white'}`}>
                        {operator === 'MTN' ? 'MTN' : 'OM'}
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-color3 text-sm uppercase tracking-widest">
                        {operator === 'MTN' ? 'MTN MoMo' : 'Orange Money'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold">
                        {operator === 'MTN' ? '67x / 68x / 65x' : '69x / 65x'}
                      </p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-color3 italic uppercase mb-2 tracking-tighter">
                    {t('payment.phoneNumber')}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                    {t('payment.phoneHint')}
                  </p>
                  <div className="relative mb-8">
                    <DeviceMobile size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="tel"
                      autoFocus
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="237XXXXXXXXX"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-color2/30 focus:bg-white rounded-2xl pl-14 pr-6 py-5 text-xl font-black text-color3 outline-none transition-all tracking-widest"
                    />
                  </div>
                  <button
                    onClick={handleFinalPayment}
                    className="w-full py-5 bg-color2 text-white font-black rounded-2xl shadow-xl shadow-color2/30 text-xs uppercase tracking-widest hover:bg-color3 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {t('payment.pay')} — {totalPrice.toLocaleString()} {t('common.fcfa')}
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <div className="max-w-md">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-50 text-center">
                  <div className="w-16 h-16 border-4 border-color2/20 border-t-color2 rounded-full animate-spin mx-auto mb-8" />
                  <h3 className="text-2xl font-black text-color3 uppercase italic mb-3 tracking-tighter">
                    {t('payment.processing')}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose mb-8">
                    {t('payment.checkPhone')}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ${
                    operator === 'MTN' ? 'bg-[#FFCC00]/20' : 'bg-[#FF6600]/20'
                  }`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      operator === 'MTN' ? 'bg-[#FFCC00]' : 'bg-[#FF6600]'
                    }`}>
                      <span className={`font-black text-[8px] ${operator === 'MTN' ? 'text-black' : 'text-white'}`}>
                        {operator === 'MTN' ? 'MTN' : 'OM'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-color3 tracking-widest">{phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif sticky */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-40">
            <div className="bg-color3 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-color2/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-color1/10 rounded-full blur-[60px]" />
              <h2 className="text-sm font-black italic uppercase tracking-widest mb-6 text-color2">
                {t('payment.summary')}
              </h2>
              <div className="space-y-5 relative z-10">
                <div className="border-b border-white/10 pb-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">
                    {t('results.departure')} → {t('results.arrival')}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm">{trip.departure?.city_name}</p>
                    <ArrowRight size={12} className="text-color2" weight="bold" />
                    <p className="font-black text-sm">{trip.destination?.city_name}</p>
                  </div>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{t('booking.passenger')}</p>
                  <p className="font-bold text-sm">{passenger?.first_name} {passenger?.last_name}</p>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">{t('booking.seats')}</p>
                  <div className="flex flex-wrap gap-2">
                    {seats.map((s: string) => (
                      <span key={s} className="bg-color2 text-white px-3 py-1 rounded-lg text-xs font-black">{s}</span>
                    ))}
                  </div>
                </div>
                {seats.length > 1 && (
                  <div className="border-b border-white/10 pb-4">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{t('payment.detail')}</p>
                    <p className="text-xs font-bold text-white/60">
                      {seats.length} × {Number(trip.price).toLocaleString()} {t('common.fcfa')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{t('common.total')}</p>
                  <p className="text-4xl font-black tracking-tighter">
                    {totalPrice.toLocaleString()}
                    <span className="text-xs text-color2 ml-1 font-bold">{t('common.fcfa')}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm">
              <ShieldCheck size={24} className="text-color2 shrink-0" weight="fill" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-relaxed">
                {t('payment.securedBy')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;