import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CheckCircle,
  Download,
  Printer,
  ShareNetwork,
  QrCode,
  MapPin,
  Calendar,
  Clock,
  Armchair,
  User,
  Phone,
  Envelope,
  Ticket as TicketIcon,
  Buildings,
  Bus,
  ArrowRight,
  House,
  Star,
} from "@phosphor-icons/react";

const ProfessionalTicketImproved = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticket, reservation, trip } = location.state || {};

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Marquer le ticket comme téléchargé
      await axios.post(`http://localhost:8000/api/tickets/${ticket.ticket_number}/download`);
      
      // Télécharger le PDF
      const response = await axios.get(
        `http://localhost:8000/api/tickets/${ticket.ticket_number}/pdf`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket-${ticket.ticket_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Ticket téléchargé avec succès !");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket Jadoo Travels - ${ticket.ticket_number}`,
          text: `Mon billet de voyage ${trip.departure.city_name} → ${trip.destination.city_name}`,
          url: window.location.href,
        });
        toast.success("Partagé avec succès !");
      } catch (error) {
        console.log("Partage annulé");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier !");
    }
  };

  const formatTime = (time: string) => time?.substring(0, 5) || "N/A";

  if (!ticket || !reservation || !trip) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600">Aucun ticket trouvé</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-success to-success-dark text-white py-12 print:hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 animate-scale-up">
            <CheckCircle size={64} weight="fill" className="text-success" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Réservation confirmée !</h1>
          <p className="text-xl text-success-100 mb-6">
            Votre voyage est réservé. Bon voyage avec Jadoo Travels ! 🚌✨
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-8 py-4 bg-white text-success rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-success"></div>
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download size={24} weight="bold" />
                  Télécharger le ticket
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              <Printer size={24} />
              Imprimer
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              <ShareNetwork size={24} />
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Ticket */}
      <div className="max-w-4xl mx-auto px-4 py-12 print:py-0">
        <div className="bg-white rounded-3xl shadow-strong overflow-hidden print:shadow-none print:rounded-none">
          {/* Header du ticket */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Jadoo Travels</h2>
                  <p className="text-primary-100">Votre partenaire de voyage</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-100 mb-1">N° Ticket</p>
                  <p className="text-2xl font-bold font-mono">{ticket.ticket_number}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-primary-100 mb-1">Départ</p>
                  <p className="text-3xl font-bold">{trip.departure.city_name}</p>
                  <p className="text-sm text-primary-100 mt-2">{formatTime(trip.departure_time)}</p>
                </div>

                <div className="px-8">
                  <div className="relative">
                    <div className="w-24 h-1 bg-white/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-white p-2 rounded-full shadow-lg">
                        <Bus size={24} className="text-primary" weight="duotone" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <p className="text-sm text-primary-100 mb-1">Arrivée</p>
                  <p className="text-3xl font-bold">{trip.destination.city_name}</p>
                  <p className="text-sm text-primary-100 mt-2">{formatTime(trip.arrival_time)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Détails du voyage */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Informations voyage */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                  <TicketIcon size={24} className="text-primary" weight="duotone" />
                  Détails du voyage
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                    <Calendar size={24} className="text-primary mt-1" weight="duotone" />
                    <div>
                      <p className="text-sm text-neutral-500">Date de départ</p>
                      <p className="font-semibold text-dark">
                        {new Date(trip.departure_date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                    <Armchair size={24} className="text-secondary mt-1" weight="duotone" />
                    <div>
                      <p className="text-sm text-neutral-500">Numéro de siège</p>
                      <p className="text-3xl font-bold text-dark">{reservation.selected_seat}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                    <Bus size={24} className="text-blue mt-1" weight="duotone" />
                    <div>
                      <p className="text-sm text-neutral-500">Bus</p>
                      <p className="font-semibold text-dark">{trip.bus?.bus_name || "Bus Standard"}</p>
                      <p className="text-xs text-neutral-400 mt-1 capitalize">
                        {trip.bus?.type === "vip" ? "VIP - Climatisé" : "Standard - Confortable"}
                      </p>
                    </div>
                  </div>

                  {reservation.departure_agency && (
                    <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl border-l-4 border-primary">
                      <Buildings size={24} className="text-primary mt-1" weight="duotone" />
                      <div>
                        <p className="text-sm text-neutral-500">Point de départ</p>
                        <p className="font-semibold text-dark">{reservation.departure_agency.agency_name}</p>
                        <p className="text-xs text-neutral-500 mt-1">{reservation.departure_agency.address}</p>
                      </div>
                    </div>
                  )}

                  {reservation.arrival_agency && (
                    <div className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl border-l-4 border-secondary">
                      <Buildings size={24} className="text-secondary mt-1" weight="duotone" />
                      <div>
                        <p className="text-sm text-neutral-500">Point d'arrivée</p>
                        <p className="font-semibold text-dark">{reservation.arrival_agency.agency_name}</p>
                        <p className="text-xs text-neutral-500 mt-1">{reservation.arrival_agency.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations passager + QR Code */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                  <User size={24} className="text-primary" weight="duotone" />
                  Informations passager
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500 mb-2">Nom complet</p>
                    <p className="text-lg font-bold text-dark">
                      {reservation.passenger_first_name} {reservation.passenger_last_name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Envelope size={16} />
                        <p className="text-xs">Email</p>
                      </div>
                      <p className="text-sm font-medium text-dark break-all">{reservation.passenger_email}</p>
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Phone size={16} />
                        <p className="text-xs">Téléphone</p>
                      </div>
                      <p className="text-sm font-medium text-dark">{reservation.passenger_phone}</p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-dashed border-primary text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-white rounded-xl shadow-soft">
                        <QrCode size={120} className="text-dark" weight="duotone" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-dark mb-1">Code de vérification</p>
                    <p className="text-xs text-neutral-600">Présentez ce QR code à l'embarquement</p>
                    <p className="text-xs text-neutral-400 mt-2 font-mono">{ticket.qr_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Montant */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Montant payé</p>
                  <p className="text-4xl font-bold text-primary">{trip.price?.toLocaleString()} FCFA</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500 mb-1">Statut</p>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-700 rounded-full font-semibold">
                    <CheckCircle size={20} weight="fill" />
                    Confirmé
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 px-8 py-6 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Contact</p>
                <p className="font-semibold text-dark">+237 6XX XXX XXX</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Email</p>
                <p className="font-semibold text-dark">support@jadootravels.cm</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Website</p>
                <p className="font-semibold text-dark">www.jadootravels.cm</p>
              </div>
            </div>
          </div>

          {/* Important notice */}
          <div className="bg-warning-50 px-8 py-6 border-t border-warning-200">
            <h4 className="font-semibold text-dark mb-3 flex items-center gap-2">
              <Star size={20} className="text-warning" weight="fill" />
              Informations importantes
            </h4>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-warning mt-1 flex-shrink-0" />
                <span>Présentez-vous au point de départ 30 minutes avant l'heure de départ</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-warning mt-1 flex-shrink-0" />
                <span>Munissez-vous de votre pièce d'identité et de ce ticket (imprimé ou numérique)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-warning mt-1 flex-shrink-0" />
                <span>Remboursement possible jusqu'à 2h après le paiement si ticket non téléchargé</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-warning mt-1 flex-shrink-0" />
                <span>En cas de problème, contactez notre service client</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-4 print:hidden">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-8 py-4 bg-white text-dark rounded-xl font-semibold hover:shadow-lg transition-all border border-neutral-200"
          >
            <House size={24} />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate("/traveler/dashboard")}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-strong transition-all"
          >
            Mes réservations
            <ArrowRight size={24} weight="bold" />
          </button>
        </div>

        {/* Merci */}
        <div className="mt-8 text-center print:hidden">
          <p className="text-2xl font-bold text-dark mb-2">Merci de voyager avec Jadoo Travels ! 🎉</p>
          <p className="text-neutral-600">Nous vous souhaitons un excellent voyage</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTicketImproved;
