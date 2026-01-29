// src/pages/TicketDetails.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Bus, 
  Clock, 
  MapPin, 
  Star, 
  Users, 
 
  Coffee, 
  ShieldCheck,
  ArrowLeft,
  Armchair,
  Lightning,
  CurrencyCircleDollar
} from "@phosphor-icons/react";
import { Button } from "../atoms/Button";
import { Text } from "../atoms/Text";
import { Fade, Slide } from "react-awesome-reveal";
import toast from "react-hot-toast";

interface Ticket {
  id: number;
  busName: string;
  type: "standard" | "vip";
  price: number;
  totalSeats: number;
  availableSeats: number;
  features: string[];
}

const TicketDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { departure, destination, date, departureTime, arrivalTime } = location.state || {};

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (departure && destination && date) {
      // Simulating ticket loading
      setLoading(true);
      setTimeout(() => {
        const mockTickets: Ticket[] = [
          {
            id: 1,
            busName: "Express Cameroon",
            type: "standard",
            price: 5000,
            totalSeats: 45,
            availableSeats: 12,
            features: ["Comfortable seats", "Insurance included", "Air conditioning"]
          },
          {
            id: 2,
            busName: "Luxury Travel VIP",
            type: "vip",
            price: 12000,
            totalSeats: 30,
            availableSeats: 8,
            features: ["Free WiFi", "Refreshments", "Reclining seats", "Priority boarding"]
          },
          {
            id: 3,
            busName: "Central Voyages",
            type: "standard",
            price: 4500,
            totalSeats: 50,
            availableSeats: 20,
            features: ["Comfortable seats", "Insurance included", "Luggage space"]
          },
          {
            id: 4,
            busName: "Premium Bus Services",
            type: "vip",
            price: 15000,
            totalSeats: 25,
            availableSeats: 5,
            features: ["High-speed WiFi", "Premium snacks", "Spacious seats", "Personalized service"]
          }
        ];
        setTickets(mockTickets);
        setLoading(false);
      }, 1000);
    }
  }, [departure, destination, date]);

  const handleSelectTicket = (ticket: Ticket) => {
    if (ticket.availableSeats === 0) {
      toast.error("Sorry, this bus is fully booked!");
      return;
    }
    toast.success("Ticket selected! Redirecting...");
    setTimeout(() => {
      navigate("/confirmation", { 
        state: { 
          departure, 
          destination, 
          date, 
          departureTime, 
          arrivalTime,
          ticket 
        } 
      });
    }, 800);
  };

  if (!departure || !destination || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 mt-24">
        <Fade>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} weight="duotone" className="text-red-500" />
            </div>
            <Text as="p" className="text-red-600 font-bold text-xl mb-2">
              Missing Information
            </Text>
            <Text as="p" className="text-gray-600 mb-6">
              Please perform a search from the homepage.
            </Text>
            <Button
              type="button"
              onClick={() => navigate("/")}
              className="bg-color2 text-white px-6 py-3 rounded-lg font-medium hover:bg-color3 transition-all w-full"
            >
              Back to Home
            </Button>
          </div>
        </Fade>
      </div>
    );
  }

  const getFeatureIcon = (feature: string) => {
 
    if (feature.toLowerCase().includes("refresh") || feature.toLowerCase().includes("snack")) 
      return <Coffee size={18} weight="duotone" />;
    if (feature.toLowerCase().includes("seat")) return <Armchair size={18} weight="duotone" />;
    if (feature.toLowerCase().includes("insurance") || feature.toLowerCase().includes("priority")) 
      return <ShieldCheck size={18} weight="duotone" />;
    return <Lightning size={18} weight="duotone" />;
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen mt-24">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-color2 to-color3 text-white py-12 px-6 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Fade direction="down">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-blue-100 hover:text-white transition-all flex items-center gap-2 group"
            >
              <ArrowLeft size={22} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          </Fade>
          
          <Slide direction="left">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative flex h-14 w-14">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30"></span>
                <span className="relative flex justify-center items-center text-color2 rounded-full h-14 w-14 bg-white shadow-lg">
                  <Bus size={28} weight="duotone" />
                </span>
              </div>
              <Text as="h1" className="text-4xl font-bold">
                Available Tickets
              </Text>
            </div>
          </Slide>

          <Fade direction="up" delay={200}>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4 border border-white/20">
              <div className="flex flex-wrap items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <MapPin size={20} weight="duotone" />
                  <Text as="span" className="font-semibold text-lg">
                    {departure}
                  </Text>
                  <span className="mx-1">→</span>
                  <Text as="span" className="font-semibold text-lg">
                    {destination}
                  </Text>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-2">
                  <Clock size={20} weight="duotone" />
                  <Text as="span" className="font-medium">
                    {departureTime} - {arrivalTime}
                  </Text>
                </div>
                <span className="text-white/60">•</span>
                <Text as="span" className="font-medium">
                  {date}
                </Text>
              </div>
            </div>
          </Fade>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-color2 border-t-transparent"></div>
              <Bus size={32} weight="duotone" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-color2" />
            </div>
            <Text as="p" className="mt-4 text-gray-600 font-medium">
              Searching for the best routes...
            </Text>
          </div>
        ) : tickets.length === 0 ? (
          <Fade>
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus size={48} weight="duotone" className="text-gray-400" />
              </div>
              <Text as="p" className="text-xl text-gray-600 font-bold mb-2">
                No tickets available
              </Text>
              <Text as="p" className="text-gray-500">
                Try another date or destination
              </Text>
            </div>
          </Fade>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tickets.map((ticket, index) => {
              const isVIP = ticket.type === "vip";
              const availabilityColor = getAvailabilityColor(ticket.availableSeats, ticket.totalSeats);
              
              return (
                <Fade key={ticket.id} delay={index * 100}>
                  <div
                    className={`relative rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 ${
                      isVIP
                        ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-yellow-400"
                        : "bg-white border-2 border-gray-200"
                    }`}
                  >
                    {/* VIP Badge */}
                    {isVIP && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                          <Star size={16} weight="fill" />
                          <span className="text-sm font-bold">VIP</span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Bus Name */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bus size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
                          <Text as="h2" className={`text-2xl font-bold ${isVIP ? "text-amber-900" : "text-gray-800"}`}>
                            {ticket.busName}
                          </Text>
                        </div>
                        
                        {/* Trip Info */}
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock size={16} weight="duotone" />
                          <span className="font-medium">{departureTime} → {arrivalTime}</span>
                        </div>
                      </div>

                      {/* Seats Info */}
                      <div className="bg-white/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users size={20} weight="duotone" className="text-gray-600" />
                            <Text as="span" className="text-sm font-semibold text-gray-700">
                              Total Capacity
                            </Text>
                          </div>
                          <Text as="span" className="text-lg font-bold text-gray-800">
                            {ticket.totalSeats} seats
                          </Text>
                        </div>
                        <div className="flex items-center justify-between">
                          <Text as="span" className="text-sm font-medium text-gray-600">
                            Available Seats
                          </Text>
                          <Text as="span" className={`text-lg font-bold ${availabilityColor}`}>
                            {ticket.availableSeats} remaining
                          </Text>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              ticket.availableSeats > ticket.totalSeats * 0.5 ? "bg-green-500" :
                              ticket.availableSeats > ticket.totalSeats * 0.2 ? "bg-orange-500" : "bg-red-500"
                            }`}
                            style={{ width: `${(ticket.availableSeats / ticket.totalSeats) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        <Text as="p" className="text-sm font-semibold text-gray-700 mb-2">
                          Included Services:
                        </Text>
                        {ticket.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-sm ${
                              isVIP ? "text-amber-800" : "text-gray-700"
                            }`}
                          >
                            <div className={isVIP ? "text-amber-600" : "text-color2"}>
                              {getFeatureIcon(feature)}
                            </div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price & Button */}
                      <div className="pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Text as="p" className="text-sm text-gray-500 mb-1">
                              Ticket Price
                            </Text>
                            <div className="flex items-center gap-1">
                              <CurrencyCircleDollar size={28} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
                              <Text as="p" className={`text-3xl font-bold ${isVIP ? "text-amber-600" : "text-color2"}`}>
                                {ticket.price.toLocaleString()}
                                <span className="text-lg ml-1">FCFA</span>
                              </Text>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleSelectTicket(ticket)}
                          disabled={ticket.availableSeats === 0}
                          className={`w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${
                            ticket.availableSeats === 0
                              ? "bg-gray-400 cursor-not-allowed"
                              : isVIP
                              ? "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600"
                              : "bg-color2 hover:bg-color3"
                          }`}
                        >
                          {ticket.availableSeats === 0 ? "Fully Booked" : "Select this ticket"}
                        </Button>
                      </div>
                    </div>

                    {/* Decorative Element */}
                    {isVIP && (
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
                    )}
                  </div>
                </Fade>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ TICKET DETAILS FIXED VERSION
// src/pages/TicketDetails.tsx

// import { useLocation, useNavigate } from "react-router-dom"
// import { useState, useEffect } from "react"
// import { Bus, ArrowLeft, Coffee, Armchair, ShieldCheck, Lightning } from "@phosphor-icons/react"
// import { Button } from "../atoms/Button"
// import { Text } from "../../components/atoms/Text"
// import { Fade, Slide } from "react-awesome-reveal"
// import toast from "react-hot-toast"
// import { Trip } from "../../services/api"

// interface LocationState {
//   trips: Trip[]
//   departure: string
//   destination: string
//   date: string
//   departureTime: string
//   arrivalTime: string
// }

// interface FormattedTicket {
//   id: number
//   tripCode: string
//   busName: string
//   type: 'standard' | 'vip'
//   price: number
//   totalSeats: number
//   availableSeats: number
//   features: string[]
//   departure: string
//   destination: string
//   date: string
//   departureTime: string
//   arrivalTime: string
// }

// const TicketDetails = (): JSX.Element => {
//   const location = useLocation()
//   const navigate = useNavigate()
  
//   const state = location.state as LocationState
//   const { trips, departure, destination, date, departureTime, arrivalTime } = state || {}

//   const [tickets, setTickets] = useState<FormattedTicket[]>([])
//   const [loading, setLoading] = useState<boolean>(true)

//   useEffect(() => {
//     if (!trips || trips.length === 0) {
//       toast.error("No trips found. Please search again.")
//       navigate("/")
//       return
//     }

//     // Transformer les données API pour l'affichage
//     const formattedTickets: FormattedTicket[] = trips.map(trip => ({
//       id: trip.id,
//       tripCode: trip.trip_code,
//       busName: trip.bus_name,
//       type: trip.bus_type,
//       price: trip.price,
//       totalSeats: 50,
//       availableSeats: trip.available_seats,
//       features: trip.bus_type === 'vip' 
//         ? ["Free WiFi", "Refreshments", "Reclining seats", "Priority boarding"]
//         : ["Comfortable seats", "Insurance included", "Air conditioning"],
//       departure: trip.departure,
//       destination: trip.destination,
//       date: trip.date,
//       departureTime: trip.departure_time,
//       arrivalTime: trip.arrival_time
//     }))

//     setTickets(formattedTickets)
//     setLoading(false)
//   }, [trips, navigate])

//   const handleSelectTicket = (ticket: FormattedTicket): void => {
//     if (ticket.availableSeats === 0) {
//       toast.error("Sorry, this bus is fully booked!")
//       return
//     }

//     toast.success("Ticket selected!")
    
//     navigate("/confirmation", { 
//       state: { 
//         departure: ticket.departure,
//         destination: ticket.destination,
//         date: ticket.date,
//         departureTime: ticket.departureTime,
//         arrivalTime: ticket.arrivalTime,
//         ticket: {
//           id: ticket.id,
//           tripCode: ticket.tripCode,
//           busName: ticket.busName,
//           type: ticket.type,
//           price: ticket.price,
//           availableSeats: ticket.availableSeats,
//           features: ticket.features
//         }
//       } 
//     })
//   }

//   const getFeatureIcon = (feature: string): JSX.Element => {
//     if (feature.toLowerCase().includes("refresh")) return <Coffee size={18} />
//     if (feature.toLowerCase().includes("seat")) return <Armchair size={18} />
//     if (feature.toLowerCase().includes("insurance")) return <ShieldCheck size={18} />
//     return <Lightning size={18} />
//   }

//   if (!departure || !destination) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 mt-24">
//         <div className="text-center">
//           <Text as="h2" className="text-2xl font-bold mb-4">No search results</Text>
//           <Button onClick={() => navigate("/")} className="bg-color2 text-white px-6 py-3 rounded-lg">
//             Back to Home
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen mt-24">
//       <div className="bg-gradient-to-r from-color2 to-color3 text-white py-12 px-6 shadow-2xl">
//         <button onClick={() => navigate(-1)} className="flex gap-2 items-center mb-4 group">
//           <ArrowLeft size={22} />
//           <span className="group-hover:underline">Back</span>
//         </button>

//         <Slide direction="left">
//           <Text as="h1" className="text-4xl font-bold mb-2">Available Tickets</Text>
//         </Slide>

//         <Text as="h3" className="text-lg font-medium">
//           {departure} → {destination} • {departureTime} - {arrivalTime} • {date}
//         </Text>
//       </div>

//       <div className="max-w-6xl mx-auto px-6 py-12">
//         {loading ? (
//           <div className="text-center py-20">
//             <div className="animate-spin rounded-full h-14 w-14 border-4 border-color2 border-t-transparent mx-auto"></div>
//             <Text className="mt-4 text-gray-600">Loading tickets...</Text>
//           </div>
//         ) : tickets.length === 0 ? (
//           <div className="text-center py-20">
//             <Text as="h2" className="text-2xl font-bold mb-4">No tickets available</Text>
//             <Button onClick={() => navigate("/")} className="bg-color2 text-white px-6 py-3 rounded-lg">
//               Try another search
//             </Button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center">
//             {tickets.map((ticket, index) => {
//               const isVIP = ticket.type === "vip"
//               return (
//                 <Fade key={ticket.id} delay={index * 100}>
//                   <div className={`w-full max-w-[430px] rounded-2xl shadow-xl overflow-hidden transition hover:scale-[1.02] ${
//                       isVIP ? "bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-amber-500"
//                           : "bg-white border-2 border-gray-200"
//                     }`}
//                   >
//                     <div className="p-6">
//                       <div className="flex items-center gap-2 mb-3">
//                         <Bus size={24} className={isVIP ? "text-amber-700" : "text-color2"} />
//                         <Text as="h2" className="font-bold text-xl">{ticket.busName}</Text>
//                       </div>

//                       <div className="text-xs text-gray-600 mb-2">
//                         Trip: {ticket.tripCode}
//                       </div>

//                       <div className="flex justify-between items-center mb-4">
//                         <Text className="text-gray-700">{ticket.availableSeats} seats available</Text>
//                         <div className="font-bold text-xl text-color2">{ticket.price.toLocaleString()} FCFA</div>
//                       </div>

//                       <ul className="space-y-1 mb-4">
//                         {ticket.features.map((f, i) => (
//                           <li key={i} className="flex gap-2 items-center text-sm text-gray-700">
//                             {getFeatureIcon(f)} {f}
//                           </li>
//                         ))}
//                       </ul>

//                       <Button
//                         onClick={() => handleSelectTicket(ticket)}
//                         disabled={ticket.availableSeats === 0}
//                         className={`w-full py-2 rounded-lg font-bold ${
//                           isVIP ? "bg-amber-600" : "bg-color2"
//                         } text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
//                       >
//                         {ticket.availableSeats === 0 ? "Fully Booked" : "Select Ticket"}
//                       </Button>
//                     </div>
//                   </div>
//                 </Fade>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default TicketDetails