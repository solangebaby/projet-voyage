import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Armchair,
  User,
  Envelope,
  Phone,
  IdentificationCard,
  GenderIntersex,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
  MapPin,
  Calendar,
  Clock,
  CurrencyDollar,
} from "@phosphor-icons/react";

const ConfirmationImproved = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, departure_city, arrival_city, departure_agency, arrival_agency } = location.state || {};

  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"seat" | "info">("seat");

  const [passengerInfo, setPassengerInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    cni: "",
    nationality: "Camerounaise",
  });

  useEffect(() => {
    if (!trip) {
      toast.error("Aucun voyage sélectionné");
      navigate("/");
      return;
    }
    fetchOccupiedSeats();
  }, []);

  const fetchOccupiedSeats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/trips/${trip.id}`);
      if (response.data.success) {
        const seats = response.data.data.occupied_seats
          ? JSON.parse(response.data.data.occupied_seats)
          : [];
        setOccupiedSeats(seats);
      }
    } catch (error) {
      console.error("Error fetching occupied seats:", error);
      toast.error("Erreur lors du chargement des sièges");
    } finally {
      setLoading(false);
    }
  };

  const generateSeats = () => {
    const totalSeats = trip.bus?.total_seats || 40;
    const seats = [];
    const seatsPerRow = 4;
    const rows = Math.ceil(totalSeats / seatsPerRow);

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= seatsPerRow; col++) {
        const seatNumber = `${String.fromCharCode(64 + col)}${row}`;
        if (seats.length < totalSeats) {
          seats.push(seatNumber);
        }
      }
    }
    return seats;
  };

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat)) {
      toast.error("Ce siège est déjà occupé");
      return;
    }
    setSelectedSeat(seat);
    toast.success(`Siège ${seat} sélectionné`);
  };

  const handleContinueToInfo = () => {
    if (!selectedSeat) {
      toast.error("Veuillez sélectionner un siège");
      return;
    }
    setStep("info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passengerInfo.first_name || !passengerInfo.last_name) {
      toast.error("Nom et prénom requis");
      return;
    }
    if (!passengerInfo.email || !passengerInfo.phone) {
      toast.error("Email et téléphone requis");
      return;
    }
    if (!passengerInfo.gender) {
      toast.error("Veuillez sélectionner votre sexe");
      return;
    }
    if (!passengerInfo.cni || passengerInfo.cni.length < 8) {
      toast.error("CNI invalide (minimum 8 caractères)");
      return;
    }

    // Navigate to payment
    navigate("/payment", {
      state: {
        trip,
        selectedSeat,
        passengerInfo,
        departure_city,
        arrival_city,
        departure_agency,
        arrival_agency,
      },
    });
  };

  const formatTime = (time: string) => time?.substring(0, 5) || "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-dark text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <div className="bg-dark text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {step === "seat" ? "Sélectionnez votre siège" : "Vos informations"}
              </h1>
              <p className="text-neutral-300">
                {step === "seat" ? "Choisissez votre siège préféré" : "Complétez vos informations de voyage"}
              </p>
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
            <div className={`flex items-center gap-2 ${step === "seat" ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "seat" ? "bg-primary" : "bg-white/20"}`}>
                1
              </div>
              <span className="text-sm font-medium">Siège</span>
            </div>
            <div className="w-12 h-0.5 bg-white/20"></div>
            <div className={`flex items-center gap-2 ${step === "info" ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "info" ? "bg-primary" : "bg-white/20"}`}>
                2
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className="w-12 h-0.5 bg-white/20"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                3
              </div>
              <span className="text-sm font-medium">Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === "seat" ? (
              /* Sélection de siège */
              <div className="bg-white rounded-2xl shadow-soft p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark mb-2">Plan du bus</h2>
                  <p className="text-neutral-500">Cliquez sur un siège disponible pour le sélectionner</p>
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-6 mb-8 p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-neutral-200 rounded-lg"></div>
                    <span className="text-sm text-neutral-600">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-danger-100 text-danger rounded-lg flex items-center justify-center">
                      <X size={20} />
                    </div>
                    <span className="text-sm text-neutral-600">Occupé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center">
                      <CheckCircle size={20} weight="fill" />
                    </div>
                    <span className="text-sm text-neutral-600">Votre sélection</span>
                  </div>
                </div>

                {/* Sièges */}
                <div className="mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="px-6 py-2 bg-dark text-white rounded-lg text-sm font-medium">
                      Conducteur
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                    {generateSeats().map((seat) => {
                      const isOccupied = occupiedSeats.includes(seat);
                      const isSelected = selectedSeat === seat;

                      return (
                        <button
                          key={seat}
                          onClick={() => handleSeatClick(seat)}
                          disabled={isOccupied}
                          className={`
                            aspect-square rounded-lg font-semibold text-sm transition-all duration-300 transform
                            ${isOccupied
                              ? "bg-danger-100 text-danger cursor-not-allowed"
                              : isSelected
                              ? "bg-primary text-white scale-110 shadow-primary"
                              : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 hover:scale-105"
                            }
                          `}
                        >
                          {isOccupied ? <X size={20} className="mx-auto" /> : seat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedSeat && (
                  <div className="p-6 bg-primary-50 rounded-xl border-l-4 border-primary">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={32} weight="fill" className="text-primary" />
                      <div>
                        <p className="font-semibold text-dark">Siège sélectionné</p>
                        <p className="text-2xl font-bold text-primary">{selectedSeat}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleContinueToInfo}
                  disabled={!selectedSeat}
                  className={`
                    w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2
                    transition-all duration-300
                    ${selectedSeat
                      ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-strong"
                      : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    }
                  `}
                >
                  Continuer
                  <ArrowRight size={20} weight="bold" />
                </button>
              </div>
            ) : (
              /* Formulaire passager */
              <div className="bg-white rounded-2xl shadow-soft p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark mb-2">Informations passager</h2>
                  <p className="text-neutral-500">Ces informations seront utilisées pour votre ticket</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Prénom */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Prénom <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={passengerInfo.first_name}
                          onChange={(e) => setPassengerInfo({ ...passengerInfo, first_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Jean"
                        />
                      </div>
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Nom <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={passengerInfo.last_name}
                          onChange={(e) => setPassengerInfo({ ...passengerInfo, last_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Email <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Envelope size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={passengerInfo.email}
                          onChange={(e) => setPassengerInfo({ ...passengerInfo, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="jean.dupont@email.com"
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Téléphone <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={passengerInfo.phone}
                          onChange={(e) => setPassengerInfo({ ...passengerInfo, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="+237 6XX XXX XXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sexe */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Sexe <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <GenderIntersex size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <select
                          required
                          value={passengerInfo.gender}
                          onChange={(e) => setPassengerInfo({ ...passengerInfo, gender: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                        >
                          <option value="">Sélectionner</option>
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                        </select>
                      </div>
                    </div>

                    {/* CNI */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        CNI <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <IdentificationCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={passengerInfo.cni}
                          onChange={(e) => setPassengerInfo({ ...passengerInfo, cni: e.target.value.toUpperCase() })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="CM12345678"
                          maxLength={15}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nationalité */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Nationalité</label>
                    <div className="relative">
                      <Globe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={passengerInfo.nationality}
                        onChange={(e) => setPassengerInfo({ ...passengerInfo, nationality: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep("seat")}
                      className="flex-1 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-strong transition-all flex items-center justify-center gap-2"
                    >
                      Continuer au paiement
                      <ArrowRight size={20} weight="bold" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-6">
              <h3 className="text-xl font-bold text-dark mb-6">Résumé du voyage</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Départ</p>
                    <p className="font-semibold text-dark">{departure_city?.city_name}</p>
                    {departure_agency && (
                      <p className="text-xs text-neutral-400">{departure_agency.agency_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-secondary mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Arrivée</p>
                    <p className="font-semibold text-dark">{arrival_city?.city_name}</p>
                    {arrival_agency && (
                      <p className="text-xs text-neutral-400">{arrival_agency.agency_name}</p>
                    )}
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
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-accent mt-1" weight="duotone" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500">Horaires</p>
                    <p className="font-semibold text-dark">
                      {formatTime(trip.departure_time)} → {formatTime(trip.arrival_time)}
                    </p>
                  </div>
                </div>

                {selectedSeat && (
                  <div className="flex items-start gap-3">
                    <Armchair size={20} className="text-primary mt-1" weight="duotone" />
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500">Siège</p>
                      <p className="font-semibold text-dark">{selectedSeat}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-600">Prix du billet</span>
                  <span className="font-semibold text-dark">{trip.price?.toLocaleString()} FCFA</span>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>Taxes incluses</span>
                </div>
              </div>

              <div className="border-t border-neutral-200 mt-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-dark">Total</span>
                  <span className="text-2xl font-bold text-primary">{trip.price?.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationImproved;
