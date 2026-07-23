import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketForScan } from '../../services/api';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';

const ScanPage = () => {
  const { ticketNumber } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!ticketNumber) return;
    getTicketForScan(ticketNumber)
      .then(res => setData(res))
      .catch(() => setError('Ticket introuvable ou invalide.'))
      .finally(() => setLoading(false));
  }, [ticketNumber]);

  const formatTime = (t: string) => t?.slice(0, 5) || '—';
  const formatDate = (d: any) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative flex h-12 w-12 mx-auto mb-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color1 opacity-40" />
            <span className="relative flex justify-center items-center rounded-full h-12 w-12 bg-color2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </span>
          </div>
          <p className="text-color3 font-semibold text-sm uppercase tracking-widest">Vérification du ticket...</p>
        </div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-color3 mb-2">Ticket invalide</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/')}
            className="bg-color2 hover:bg-color3 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105">
            Retour à l'accueil
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Structure exacte retournée par showForScan() de ton TicketController
  const { passenger, trip, reservation, payment } = data;
  const isValid = data.ticket_status === 'valid';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 pt-24 pb-16 px-4 max-w-2xl mx-auto w-full">

        {/* Bandeau statut */}
        <div className={`rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-lg ${
          isValid ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isValid ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isValid ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-black text-lg ${isValid ? 'text-green-700' : 'text-red-700'}`}>
              {isValid ? 'Ticket Valide ✓' : 'Ticket Invalide'}
            </p>
            <p className="text-sm text-gray-500 font-mono">{data.ticket_number}</p>
          </div>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xl">

          <div className="bg-color3 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Marketplace Transport Cameroun</p>
              <h1 className="text-white text-xl font-black">DÉTAILS DU TICKET</h1>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs uppercase tracking-widest font-bold">N° Ticket</p>
              <p className="text-white font-black text-lg tracking-wider font-mono">{data.ticket_number}</p>
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                isValid ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
              }`}>
                {isValid ? 'Validé & Payé' : data.ticket_status}
              </span>
            </div>
          </div>

          {/* Bande route — departure_city / arrival_city (clés de showForScan) */}
          <div className="bg-color2 px-6 py-3 flex items-center justify-between">
            <div className="text-white">
              <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Départ</p>
              <p className="text-xl font-black">{trip?.departure_city || '—'}</p>
              <p className="text-sm font-semibold opacity-90">{formatTime(trip?.departure_time)}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <p className="text-white/70 text-xs">{formatDate(trip?.departure_date)}</p>
            </div>
            <div className="text-white text-right">
              <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Arrivée</p>
              <p className="text-xl font-black">{trip?.arrival_city || '—'}</p>
              <p className="text-sm font-semibold opacity-90">{formatTime(trip?.arrival_time)}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Passager */}
            <div>
              <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-2">Passager</p>
              <p className="text-2xl font-black text-color3 mb-3">{passenger?.first_name} {passenger?.last_name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Genre</p>
                  <p className="font-semibold text-color3">{passenger?.gender === 'M' ? 'Masculin' : passenger?.gender === 'F' ? 'Féminin' : '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Nationalité</p>
                  <p className="font-semibold text-color3">{passenger?.nationality || '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">CNI</p>
                  <p className="font-semibold text-color3">{passenger?.cni || '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Téléphone</p>
                  <p className="font-semibold text-color3">{passenger?.phone || '—'}</p></div>
              </div>
            </div>

            {/* Voyage — bus_name / agency_name directement (clés de showForScan) */}
            <div className="border-t pt-4">
              <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-2">Détails du voyage</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Bus</p>
                  <p className="font-semibold text-color3">{trip?.bus_name || '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Siège</p>
                  <p className="font-black text-color2 text-lg">{reservation?.selected_seat || '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Agence</p>
                  <p className="font-semibold text-color3">{trip?.agency_name || '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Prix</p>
                  <p className="font-black text-color2">{Number(trip?.price || 0).toLocaleString()} FCFA</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Réservation</p>
                  <p className="font-semibold text-color3">#{reservation?.id || '—'}</p></div>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Type bus</p>
                  <p className="font-semibold text-color3">{trip?.bus_type || '—'}</p></div>
              </div>
            </div>

            {/* Paiement */}
            {payment && (
              <div className="border-t pt-4">
                <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-2">Paiement</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Méthode</p>
                    <p className="font-semibold text-color3">{payment?.method || '—'}</p></div>
                  <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Montant</p>
                    <p className="font-black text-color2">{Number(payment?.amount || 0).toLocaleString()} FCFA</p></div>
                  <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Statut</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      payment?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{payment?.status || '—'}</span></div>
                  <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Date</p>
                    <p className="font-semibold text-color3">{formatDate(payment?.completed_at)}</p></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-color3 px-6 py-3 flex items-center justify-between text-xs text-white/60">
            <span className="uppercase tracking-widest font-bold">Marketplace Transport Cameroun © {new Date().getFullYear()}</span>
            <span className="font-mono text-white/80 font-bold">{data.ticket_number}</span>
          </div>
        </div>

        <button onClick={() => navigate('/')}
          className="mt-6 w-full py-3 border-2 border-color2 text-color2 hover:bg-color2 hover:text-white font-bold rounded-xl text-sm transition-all">
          ← Retour à l'accueil
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default ScanPage;