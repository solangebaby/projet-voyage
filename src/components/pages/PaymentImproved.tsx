import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CreditCard,
  Phone,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  Armchair,
  User,
  Envelope,
  CurrencyDollar,
  DeviceMobile,
  Bank,
} from "@phosphor-icons/react";

const PaymentImproved = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, selectedSeat, passengerInfo, departure_city, arrival_city, departure_agency, arrival_agency } =
    location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "Orange" | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error("Numéro de téléphone invalide");
      return;
    }

    setLoading(true);

    try {
      // Étape 1: Créer la réservation
      const reservationResponse = await axios.post("http://localhost:8000/api/reservations", {
        trip_id: trip.id,
        selected_seat: selectedSeat,
        passenger_first_name: passengerInfo.first_name,
        passenger_last_name: passengerInfo.last_name,
        passenger_name: `${passengerInfo.first_name} ${passengerInfo.last_name}`,
        passenger_email: passengerInfo.email,
        passenger_phone: passengerInfo.phone,
        passenger_gender: passengerInfo.gender,
        passenger_cni: passengerInfo.cni,
        passenger_nationality: passengerInfo.nationality,
        departure_agency_id: departure_agency?.id,
        arrival_agency_id: arrival_agency?.id,
      });

      if (!reservationResponse.data.success) {
        throw new Error(reservationResponse.data.message);
      }

      const reservation = reservationResponse.data.data;

      // Étape 2: Initier le paiement
      const paymentResponse = await axios.post("http://localhost:8000/api/payments/initiate", {
        reservation_id: reservation.id,
        amount: trip.price,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
      });

      if (paymentResponse.data.success) {
        toast.success("Paiement initié avec succès !");
        
        // Simuler la confirmation du paiement pour le mode test
        setTimeout(async () => {
          try {
            const confirmResponse = await axios.post(
              `http://localhost:8000/api/reservations/${reservation.id}/confirm-payment`
            );

            if (confirmResponse.data.success) {
              toast.success("Paiement confirmé !");
              navigate("/ticket", {
                state: {
                  ticket: confirmResponse.data.data.ticket,
                  reservation: confirmResponse.data.data.reservation,
                  trip,
                },
              });
            }
          } catch (error) {
            console.error("Error confirming payment:", error);
            toast.error("Erreur lors de la confirmation du paiement");
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const message = error.response?.data?.message || "Erreur lors du paiement";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const detectOperator = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("237")) {
      const prefix = cleanPhone.substring(3, 6);
      if (["650", "651", "652", "653", "654", "680", "681", "682", "683"].includes(prefix)) {
        return "MTN";
      }
      if (["655", "656", "657", "658", "659", "690", "691", "692", "693", "694", "695", "696", "697", "698", "699"].includes(prefix)) {
        return "Orange";
      }
    }
    return null;
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const operator = detectOperator(value);
    if (operator) {
      setPaymentMethod(operator);
      toast(`${operator} Mobile Money détecté`, { icon: "📱" });
    }
  };

  const formatTime = (time: string) => time?.substring(0, 5) || "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <div className="bg-dark text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Paiement sécurisé</h1>
              <p className="text-neutral-300">Complétez votre réservation</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
              Retour
            </button>
          </div>

          {/* Stepper */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                <CheckCircle size={20} weight="fill" />
              </div>
              <span className="text-sm font-medium">Siège</span>
            </div>
            <div className="w-12 h-0.5 bg-white/20"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                <CheckCircle size={20} weight="fill" />
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className="w-12 h-0.5 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                3
              </div>
              <span className="text-sm font-medium">Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              {/* Sécurité badge */}
              <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl mb-8 border-l-4 border-success">
                <ShieldCheck size={32} weight="fill" className="text-success" />
                <div>
                  <p className="font-semibold text-dark">Paiement 100% sécurisé</p>
                  <p className="text-sm text-neutral-600">Vos informations sont protégées par cryptage SSL</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sélection du mode de paiement */}
                <div>
                  <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                    <CreditCard size={24} className="text-primary" weight="duotone" />
                    Mode de paiement
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* MTN Mobile Money */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("MTN")}
                      className={`
                        p-6 rounded-xl border-2 transition-all duration-300 text-left
                        ${paymentMethod === "MTN"
                          ? "border-primary bg-primary-50 shadow-primary"
                          : "border-neutral-200 hover:border-primary-200 hover:bg-neutral-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                          <DeviceMobile size={28} className="text-dark" weight="duotone" />
                        </div>
                        {paymentMethod === "MTN" && (
                          <CheckCircle size={24} weight="fill" className="text-primary" />
                        )}
                      </div>
                      <h4 className="font-bold text-dark mb-1">MTN Mobile Money</h4>
                      <p className="text-sm text-neutral-600">Payez avec MTN MoMo</p>
                      <p className="text-xs text-neutral-400 mt-2">Préfixes: 650, 651, 652, 653, 654, 68X</p>
                    </button>

                    {/* Orange Money */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Orange")}
                      className={`
                        p-6 rounded-xl border-2 transition-all duration-300 text-left
                        ${paymentMethod === "Orange"
                          ? "border-primary bg-primary-50 shadow-primary"
                          : "border-neutral-200 hover:border-primary-200 hover:bg-neutral-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Bank size={28} className="text-white" weight="duotone" />
                        </div>
                        {paymentMethod === "Orange" && (
                          <CheckCircle size={24} weight="fill" className="text-primary" />
                        )}
                      </div>
                      <h4 className="font-bold text-dark mb-1">Orange Money</h4>
                      <p className="text-sm text-neutral-600">Payez avec Orange Money</p>
                      <p className="text-xs text-neutral-400 mt-2">Préfixes: 655, 656, 657, 658, 659, 69X</p>
                    </button>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                {paymentMethod && (
                  <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                      <Phone size={24} className="text-primary" weight="duotone" />
                      Numéro de téléphone
                    </h3>
                    <div className="relative">
                      <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-lg"
                        placeholder="+237 6XX XXX XXX"
                      />
                      {paymentMethod && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            paymentMethod === "MTN" ? "bg-yellow-100 text-yellow-800" : "bg-orange-100 text-orange-800"
                          }`}>
                            {paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-neutral-500 flex items-center gap-2">
                      <Lock size={16} />
                      Vous recevrez un SMS de confirmation sur ce numéro
                    </p>
                  </div>
                )}

                {/* Instructions */}
                {paymentMethod && phoneNumber && (
                  <div className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue animate-fadeIn">
                    <h4 className="font-semibold text-dark mb-3 flex items-center gap-2">
                      <CheckCircle size={20} className="text-blue" />
                      Instructions de paiement
                    </h4>
                    <ol className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary">1.</span>
                        <span>Cliquez sur "Payer maintenant" ci-dessous</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary">2.</span>
                        <span>Vous recevrez un SMS de confirmation {paymentMethod} sur le {phoneNumber}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary">3.</span>
                        <span>Entrez votre code PIN {paymentMethod} pour valider</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary">4.</span>
                        <span>Votre ticket sera généré automatiquement</span>
                      </li>
                    </ol>
                  </div>
                )}

                {/* Bouton de paiement */}
                <button
                  type="submit"
                  disabled={!paymentMethod || !phoneNumber || loading}
                  className={`
                    w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3
                    transition-all duration-300 transform
                    ${!paymentMethod || !phoneNumber || loading
                      ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-strong hover:scale-105"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Lock size={24} weight="bold" />
                      Payer {trip?.price?.toLocaleString()} FCFA
                    </>
                  )}
                </button>

                {/* Garanties */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <ShieldCheck size={20} className="text-success" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Lock size={20} className="text-success" />
                    <span>Données cryptées</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle size={20} className="text-success" />
                    <span>Remboursement 2h</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-6">
              <h3 className="text-xl font-bold text-dark mb-6">Résumé de la commande</h3>

              {/* Voyage */}
              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Trajet</p>
                    <p className="font-semibold text-dark">
                      {departure_city?.city_name} → {arrival_city?.city_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-blue mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Date</p>
                    <p className="font-semibold text-dark">
                      {new Date(trip.departure_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-accent mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Heure</p>
                    <p className="font-semibold text-dark">{formatTime(trip.departure_time)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Armchair size={20} className="text-secondary mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Siège</p>
                    <p className="font-semibold text-dark">{selectedSeat}</p>
                  </div>
                </div>
              </div>

              {/* Passager */}
              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <h4 className="font-semibold text-dark">Passager</h4>
                <div className="flex items-start gap-3">
                  <User size={20} className="text-neutral-400 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-dark">
                      {passengerInfo.first_name} {passengerInfo.last_name}
                    </p>
                    <p className="text-sm text-neutral-500">{passengerInfo.email}</p>
                    <p className="text-sm text-neutral-500">{passengerInfo.phone}</p>
                  </div>
                </div>
              </div>

              {/* Montant */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Prix du billet</span>
                  <span className="font-semibold text-dark">{trip?.price?.toLocaleString()} FCFA</span>
                </div>
                <div className="flex items-center justify-between text-sm text-success">
                  <span>Frais de service</span>
                  <span>Gratuit</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-dark">Total à payer</span>
                    <span className="text-3xl font-bold text-primary">{trip?.price?.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Badge NotchPay */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl text-center">
                <p className="text-xs text-neutral-600 mb-1">Paiement sécurisé par</p>
                <p className="font-bold text-dark text-lg">NotchPay</p>
                <p className="text-xs text-neutral-500 mt-1">Certifié et sécurisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentImproved;
