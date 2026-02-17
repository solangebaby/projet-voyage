import { Image } from "../atoms/Image";
import bgImage from "../../assets/HeroVector.png";
import heroImage from "../../assets/girl.png";
import { Text } from "../atoms/Text";
import { HeroTexts } from "../particles/DataLists";
import { Fade, Slide } from "react-awesome-reveal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { MapPin, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";

interface Destination {
  id: number;
  city_name: string;
}

interface Agency {
  id: number;
  destination_id: number;
  agency_name: string;
  neighborhood: string;
  address?: string;
  phone?: string;
  is_main_station: boolean;
}

const HeroSectionImproved = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [departureCity, setDepartureCity] = useState<Destination | null>(null);
  const [destinationCity, setDestinationCity] = useState<Destination | null>(null);
  const [departureAgencies, setDepartureAgencies] = useState<Agency[]>([]);
  const [arrivalAgencies, setArrivalAgencies] = useState<Agency[]>([]);
  const [selectedDepartureAgency, setSelectedDepartureAgency] = useState<Agency | null>(null);
  const [selectedArrivalAgency, setSelectedArrivalAgency] = useState<Agency | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAgencySelection, setShowAgencySelection] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/destinations');
        if (response.data.success) {
          setDestinations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        toast.error('Failed to load destinations');
      }
    };

    fetchDestinations();
  }, []);

  useEffect(() => {
    const fetchDepartureAgencies = async () => {
      if (!departureCity) return;
      try {
        const response = await axios.get(`http://localhost:8000/api/agencies?destination_id=${departureCity.id}`);
        if (response.data.success) {
          setDepartureAgencies(response.data.data);
          const mainStation = response.data.data.find((a: Agency) => a.is_main_station);
          if (mainStation) setSelectedDepartureAgency(mainStation);
        }
      } catch (error) {
        console.error('Error fetching departure agencies:', error);
      }
    };

    fetchDepartureAgencies();
  }, [departureCity]);

  useEffect(() => {
    const fetchArrivalAgencies = async () => {
      if (!destinationCity) return;
      try {
        const response = await axios.get(`http://localhost:8000/api/agencies?destination_id=${destinationCity.id}`);
        if (response.data.success) {
          setArrivalAgencies(response.data.data);
          const mainStation = response.data.data.find((a: Agency) => a.is_main_station);
          if (mainStation) setSelectedArrivalAgency(mainStation);
        }
      } catch (error) {
        console.error('Error fetching arrival agencies:', error);
      }
    };

    fetchArrivalAgencies();
  }, [destinationCity]);

  const handleQuickSearch = () => {
    if (!departureCity || !destinationCity || !date) {
      toast.error("Please select departure, destination and date");
      return;
    }
    setShowAgencySelection(true);
  };

  const handleFinalSearch = async () => {
    if (!selectedDepartureAgency || !selectedArrivalAgency) {
      toast.error("Please select agencies for both departure and arrival");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/trips/search', {
        params: {
          departure: departureCity?.city_name,
          destination: destinationCity?.city_name,
          date: date
        }
      });

      if (response.data.success) {
        const filteredTrips = response.data.data.filter((trip: any) => {
          return trip.departure_agency_id === selectedDepartureAgency.id && 
                 trip.arrival_agency_id === selectedArrivalAgency.id;
        });

        if (filteredTrips.length === 0) {
          toast.error(`No trips found for ${selectedDepartureAgency.neighborhood} → ${selectedArrivalAgency.neighborhood}`);
        } else {
          toast.success(`Found ${filteredTrips.length} trip(s)!`);
          navigate('/ticket-details', {
            state: {
              trips: filteredTrips,
              departure: departureCity?.city_name,
              destination: destinationCity?.city_name,
              date: date
            }
          });
        }
      }
    } catch (error) {
      console.error('Error searching trips:', error);
      toast.error('Failed to search trips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[70vh] lg:min-h-[80vh] overflow-hidden py-16 lg:py-20">
      <Image image={bgImage} alt="bg-image" className="absolute top-0 right-0 w-[60%] lg:w-[45%] h-full object-cover -z-10" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          <Fade direction="left" triggerOnce>
            <div className="space-y-4 lg:space-y-6">
              {HeroTexts.firstText && (
                <Text as="p" className="text-sm md:text-base text-color2 font-bold uppercase tracking-wider">
                  {HeroTexts.firstText}
                </Text>
              )}
              {HeroTexts.secondText && (
                <Text as="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold text-color3 leading-tight">
                  {HeroTexts.secondText}
                </Text>
              )}
              {HeroTexts.thirdText && (
                <Text as="p" className="text-sm md:text-base text-gray-600 leading-relaxed max-w-md">
                  {HeroTexts.thirdText}
                </Text>
              )}
              
              {/* Buttons like Jadoo reference */}
              <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-color2 hover:bg-color1 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Find Out More
                </button>
                {/* Floating Bus Animation */}
                <div className="relative">
                  <div className="animate-bounce-slow">
                    <svg 
                      width="60" 
                      height="60" 
                      viewBox="0 0 64 64" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="drop-shadow-lg"
                    >
                      {/* Bus body */}
                      <rect x="8" y="16" width="48" height="28" rx="4" fill="#F97316" />
                      {/* Windows */}
                      <rect x="12" y="20" width="10" height="8" rx="1" fill="#E0F2FE" />
                      <rect x="26" y="20" width="10" height="8" rx="1" fill="#E0F2FE" />
                      <rect x="40" y="20" width="10" height="8" rx="1" fill="#E0F2FE" />
                      {/* Wheels */}
                      <circle cx="18" cy="44" r="6" fill="#1F2937" />
                      <circle cx="46" cy="44" r="6" fill="#1F2937" />
                      <circle cx="18" cy="44" r="3" fill="#6B7280" />
                      <circle cx="46" cy="44" r="3" fill="#6B7280" />
                      {/* Front light */}
                      <circle cx="54" cy="24" r="2" fill="#FDE047" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Fade>

          <Slide direction="right" triggerOnce>
            <div className="flex justify-center lg:justify-end">
              <Image image={heroImage} alt="hero-image" className="w-full max-w-[250px] md:max-w-[300px] lg:max-w-[350px] object-contain" />
            </div>
          </Slide>
        </div>

        {/* Compact Booking Form */}
        <Fade direction="up" delay={300} triggerOnce>
          <div id="booking" className="mt-8 lg:mt-12 bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-4xl mx-auto">
            {!showAgencySelection ? (
              <>
                <h3 className="text-lg md:text-xl font-semibold text-color3 mb-4 text-center">Quick Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={departureCity?.id || ''}
                    onChange={(e) => {
                      const city = destinations.find(d => d.id === Number(e.target.value));
                      setDepartureCity(city || null);
                      setSelectedDepartureAgency(null);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-color2 focus:ring-1 focus:ring-color2"
                  >
                    <option value="">From</option>
                    {destinations.map(dest => (
                      <option key={dest.id} value={dest.id}>{dest.city_name}</option>
                    ))}
                  </select>

                  <select
                    value={destinationCity?.id || ''}
                    onChange={(e) => {
                      const city = destinations.find(d => d.id === Number(e.target.value));
                      setDestinationCity(city || null);
                      setSelectedArrivalAgency(null);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-color2 focus:ring-1 focus:ring-color2"
                  >
                    <option value="">To</option>
                    {destinations.filter(d => d.id !== departureCity?.id).map(dest => (
                      <option key={dest.id} value={dest.id}>{dest.city_name}</option>
                    ))}
                  </select>

                  {/* Sélection rapide de dates */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Aujourd'hui", days: 0 },
                        { label: "Demain", days: 1 }
                      ].map((option) => {
                        const optionDate = new Date();
                        optionDate.setDate(optionDate.getDate() + option.days);
                        const dateStr = optionDate.toISOString().split('T')[0];
                        return (
                          <button
                            key={option.days}
                            type="button"
                            onClick={() => setDate(dateStr)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                              date === dateStr
                                ? 'bg-color2 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={today}
                      placeholder="Select date"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-color2 focus:ring-1 focus:ring-color2"
                    />
                  </div>

                  <button
                    onClick={handleQuickSearch}
                    disabled={!departureCity || !destinationCity || !date}
                    className="w-full bg-color2 text-white py-2.5 px-4 text-sm rounded-lg font-semibold hover:bg-color1 transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-color3">Select Agencies</h3>
                  <button onClick={() => setShowAgencySelection(false)} className="text-xs text-color2 hover:underline">
                    ← Back
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-color3 mb-2 flex items-center gap-1">
                      <MapPin size={14} className="text-color2" /> From: {departureCity?.city_name}
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {departureAgencies.map(agency => (
                        <button
                          key={agency.id}
                          onClick={() => setSelectedDepartureAgency(agency)}
                          className={`w-full p-2 rounded-lg border text-left transition-all ${
                            selectedDepartureAgency?.id === agency.id
                              ? 'border-color2 bg-color2/10'
                              : 'border-gray-200 hover:border-color2'
                          }`}
                        >
                          <p className="font-semibold text-xs text-color3">{agency.neighborhood}</p>
                          <p className="text-[10px] text-gray-600">{agency.agency_name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-color3 mb-2 flex items-center gap-1">
                      <MapPin size={14} className="text-color2" /> To: {destinationCity?.city_name}
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {arrivalAgencies.map(agency => (
                        <button
                          key={agency.id}
                          onClick={() => setSelectedArrivalAgency(agency)}
                          className={`w-full p-2 rounded-lg border text-left transition-all ${
                            selectedArrivalAgency?.id === agency.id
                              ? 'border-color2 bg-color2/10'
                              : 'border-gray-200 hover:border-color2'
                          }`}
                        >
                          <p className="font-semibold text-xs text-color3">{agency.neighborhood}</p>
                          <p className="text-[10px] text-gray-600">{agency.agency_name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinalSearch}
                  disabled={loading || !selectedDepartureAgency || !selectedArrivalAgency}
                  className="w-full bg-color2 text-white py-3 px-4 text-sm rounded-lg font-semibold hover:bg-color1 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Searching...' : (
                    <>
                      <MagnifyingGlass size={18} /> Search Trips
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default HeroSectionImproved;
