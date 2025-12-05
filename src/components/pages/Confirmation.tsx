// // src/pages/Confirmation.tsx
// import { useLocation, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { 
//   Bus, 
//   User, 
//   IdentificationCard,
//   Envelope,
//   Phone,
//   GenderIntersex,
//   MapPin,
//   Clock,
//   CurrencyCircleDollar,
//   Seat,
//   CheckCircle,
//   XCircle,
//   ArrowLeft,
//   CreditCard
// } from "@phosphor-icons/react";
// import { Button } from "../atoms/Button";
// import { Text } from "../atoms/Text";
// import { Fade } from "react-awesome-reveal";
// import toast from "react-hot-toast";

// interface Ticket {
//   id: number;
//   busName: string;
//   type: "standard" | "vip";
//   price: number;
//   totalSeats: number;
//   availableSeats: number;
//   features: string[];
// }

// const Confirmation = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { departure, destination, date, departureTime, arrivalTime, ticket } = location.state || {};

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     cniKit: "",
//     gender: "",
//     civility: "",
//     email: "",
//     phone: ""
//   });

//   const [confirmReservation, setConfirmReservation] = useState(false);
//   const [selectedSeat, setSelectedSeat] = useState<string>("");
//   const [showSeatMap, setShowSeatMap] = useState(false);

//   // Generate seat map - Bus layout with aisle
//   const generateSeats = () => {
//     const rows = ticket?.type === "vip" ? 8 : 10; // VIP has fewer rows
//     const seats: { seat: string; position: 'left' | 'right' | 'aisle' }[] = [];
    
//     for (let i = 1; i <= rows; i++) {
//       // Left side (2 seats)
//       seats.push({ seat: `A${i}`, position: 'left' });
//       seats.push({ seat: `B${i}`, position: 'left' });
      
//       // Aisle
//       seats.push({ seat: `aisle-${i}`, position: 'aisle' });
      
//       // Right side (2 seats)
//       seats.push({ seat: `C${i}`, position: 'right' });
//       seats.push({ seat: `D${i}`, position: 'right' });
//     }
    
//     return seats;
//   };

//   // Simulate occupied seats (random)
//   const [occupiedSeats] = useState<string[]>(() => {
//     const allSeats = generateSeats().filter(s => s.position !== 'aisle').map(s => s.seat);
//     const numOccupied = Math.floor(allSeats.length * 0.3); // 30% occupied
//     const occupied: string[] = [];
    
//     while (occupied.length < numOccupied) {
//       const randomSeat = allSeats[Math.floor(Math.random() * allSeats.length)];
//       if (!occupied.includes(randomSeat)) {
//         occupied.push(randomSeat);
//       }
//     }
    
//     return occupied;
//   });

//   const validateKitNumber = (kit: string): boolean => {
//     const kitRegex = /^KIT\d{3}$/;
//     return kitRegex.test(kit);
//   };

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePhone = (phone: string): boolean => {
//     // African phone number format (starting with + and 10-13 digits)
//     const phoneRegex = /^\+?[1-9]\d{9,12}$/;
//     return phoneRegex.test(phone.replace(/\s/g, ''));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleConfirmClick = () => {
//     // Validate all fields
//     if (!formData.firstName.trim() || formData.firstName.length < 2) {
//       toast.error("Invalid data: First name must be at least 2 characters");
//       return;
//     }
    
//     if (!formData.lastName.trim() || formData.lastName.length < 2) {
//       toast.error("Invalid data: Last name must be at least 2 characters");
//       return;
//     }
    
//     if (!validateKitNumber(formData.cniKit)) {
//       toast.error("Invalid data: CNI KIT format must be KIT060 (KIT followed by 3 digits)");
//       return;
//     }
    
//     if (!formData.gender) {
//       toast.error("Invalid data: Please select your gender");
//       return;
//     }
    
//     if (!formData.civility) {
//       toast.error("Invalid data: Please select your civility");
//       return;
//     }
    
//     if (!validateEmail(formData.email)) {
//       toast.error("Invalid data: Please enter a valid email address");
//       return;
//     }
    
//     if (!validatePhone(formData.phone)) {
//       toast.error("Invalid data: Please enter a valid phone number (e.g., +237612345678)");
//       return;
//     }

//     setConfirmReservation(true);
//     setShowSeatMap(true);
//     toast.success("Information validated! Please select your seat.");
//   };

//   const handleSeatClick = (seat: string) => {
//     if (occupiedSeats.includes(seat)) {
//       toast.error("This seat is already occupied!");
//       return;
//     }
    
//     setSelectedSeat(seat);
//     toast.success(`Seat ${seat} selected!`);
//   };

//   const handlePayment = () => {
//     if (!selectedSeat) {
//       toast.error("Please select a seat before proceeding to payment");
//       return;
//     }
    
//     toast.success("Redirecting to payment...");
//     setTimeout(() => {
//       navigate("/pay", { 
//         state: { 
//           departure, 
//           destination, 
//           date, 
//           departureTime, 
//           arrivalTime,
//           ticket,
//           passengerInfo: formData,
//           selectedSeat
//         } 
//       });
//     }, 800);
//   };

//   const handleCancel = () => {
//     navigate("/");
//   };

//   if (!ticket) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 mt-24">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
//           <Text as="p" className="text-red-600 font-bold text-xl mb-4">
//             No ticket selected
//           </Text>
//           <Button
//             type="button"
//             onClick={() => navigate("/")}
//             className="bg-color2 text-white px-6 py-3 rounded-lg font-medium hover:bg-color3 transition-all"
//           >
//             Back to Home
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const isVIP = ticket.type === "vip";

//   return (
//     <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen mt-24 pb-12">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-color2 to-color3 text-white py-8 px-6 shadow-2xl">
//         <div className="max-w-7xl mx-auto">
//           <button
//             onClick={() => navigate(-1)}
//             className="mb-4 text-blue-100 hover:text-white transition-all flex items-center gap-2 group"
//           >
//             <ArrowLeft size={22} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
//             <span className="font-medium">Back</span>
//           </button>
          
//           <Text as="h1" className="text-4xl font-bold">
//             Reservation Confirmation
//           </Text>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {!showSeatMap ? (
//           // Show ticket info and form when seat map is not visible
//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Left Column - Ticket Info */}
//             <Fade direction="left">
//               <div className={`rounded-2xl shadow-2xl p-6 ${
//                 isVIP ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-yellow-400" : "bg-white border-2 border-gray-200"
//               }`}>
//                 <Text as="h2" className="text-2xl font-bold mb-6 text-gray-800">
//                   Ticket Information
//                 </Text>

//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3">
//                     <Bus size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
//                     <div>
//                       <Text as="p" className="text-sm text-gray-600">Bus Company</Text>
//                       <Text as="p" className={`font-bold ${isVIP ? "text-amber-900" : "text-gray-800"}`}>
//                         {ticket.busName}
//                       </Text>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <MapPin size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
//                     <div>
//                       <Text as="p" className="text-sm text-gray-600">Route</Text>
//                       <Text as="p" className="font-bold text-gray-800">
//                         {departure} → {destination}
//                       </Text>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <Clock size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
//                     <div>
//                       <Text as="p" className="text-sm text-gray-600">Departure Time</Text>
//                       <Text as="p" className="font-bold text-gray-800">
//                         {date} at {departureTime}
//                       </Text>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <CurrencyCircleDollar size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
//                     <div>
//                       <Text as="p" className="text-sm text-gray-600">Price</Text>
//                       <Text as="p" className={`text-2xl font-bold ${isVIP ? "text-amber-600" : "text-color2"}`}>
//                         {ticket.price.toLocaleString()} FCFA
//                       </Text>
//                     </div>
//                   </div>

//                   {isVIP && (
//                     <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-4">
//                       <CheckCircle size={20} weight="fill" />
//                       <Text as="span" className="font-bold">VIP Class</Text>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Fade>

//             {/* Right Column - Passenger Form */}
//             <Fade direction="right">
//               <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-gray-200">
//                 <Text as="h2" className="text-2xl font-bold mb-6 text-gray-800">
//                   Passenger Information
//                 </Text>

//                 <div className="space-y-4">
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <User size={16} weight="duotone" className="inline mr-1" />
//                         First Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="firstName"
//                         value={formData.firstName}
//                         onChange={handleInputChange}
//                         className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                         placeholder="John"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <User size={16} weight="duotone" className="inline mr-1" />
//                         Last Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="lastName"
//                         value={formData.lastName}
//                         onChange={handleInputChange}
//                         className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                         placeholder="Doe"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <IdentificationCard size={16} weight="duotone" className="inline mr-1" />
//                       CNI KIT Number * (Format: KIT060)
//                     </label>
//                     <input
//                       type="text"
//                       name="cniKit"
//                       value={formData.cniKit}
//                       onChange={handleInputChange}
//                       className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                       placeholder="KIT060"
//                       maxLength={6}
//                     />
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Civility *
//                       </label>
//                       <select
//                         name="civility"
//                         value={formData.civility}
//                         onChange={handleInputChange}
//                         className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                       >
//                         <option value="">Select</option>
//                         <option value="Mr">Mr</option>
//                         <option value="Mrs">Mrs</option>
//                         <option value="Miss">Miss</option>
//                         <option value="Dr">Dr</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <GenderIntersex size={16} weight="duotone" className="inline mr-1" />
//                         Gender *
//                       </label>
//                       <select
//                         name="gender"
//                         value={formData.gender}
//                         onChange={handleInputChange}
//                         className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                       >
//                         <option value="">Select</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <Envelope size={16} weight="duotone" className="inline mr-1" />
//                       Email *
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                       placeholder="john.doe@example.com"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <Phone size={16} weight="duotone" className="inline mr-1" />
//                       Phone Number * (e.g., +237612345678)
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                       className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
//                       placeholder="+237612345678"
//                     />
//                   </div>

//                   <div className="bg-blue-50 rounded-lg p-4 mt-6">
//                     <Text as="p" className="text-sm font-semibold text-gray-800 mb-3">
//                       Do you want to proceed with this reservation?
//                     </Text>
//                     <Button
//                       type="button"
//                       onClick={handleConfirmClick}
//                       className="w-full py-3 rounded-lg font-bold text-white transition-all bg-color2 hover:bg-color3 shadow-lg hover:shadow-xl"
//                     >
//                       Yes, Confirm Information
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </Fade>
//           </div>
//         ) : (
//           // Show only seat map when confirmed
//           <Fade>
//             <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-gray-200 max-w-2xl mx-auto">
//               <Text as="h2" className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
//                 Select Your Seat
//               </Text>

//               <div>
//                 {/* Bus Front */}
//                 <div className="bg-gradient-to-b from-gray-800 to-gray-700 rounded-t-3xl p-4 mb-2">
//                   <div className="flex justify-center items-center gap-3">
//                     <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-600">
//                       <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
//                     </div>
//                     <Text as="p" className="text-white font-bold text-lg">DRIVER</Text>
//                   </div>
//                 </div>

//                 {/* Bus Body with Seats */}
//                 <div className="bg-gradient-to-b from-blue-100 to-blue-50 border-4 border-gray-700 rounded-b-3xl p-4 md:p-6">
//                   {/* Seat Grid */}
//                   <div className="space-y-3">
//                     {Array.from({ length: ticket.type === "vip" ? 8 : 10 }).map((_, rowIndex) => {
//                       const rowNumber = rowIndex + 1;
//                       return (
//                         <div key={rowNumber} className="grid grid-cols-5 gap-2 items-center">
//                           {/* Left Seats (A & B) */}
//                           {['A', 'B'].map((letter) => {
//                             const seatId = `${letter}${rowNumber}`;
//                             const isOccupied = occupiedSeats.includes(seatId);
//                             const isSelected = selectedSeat === seatId;
                            
//                             return (
//                               <button
//                                 key={seatId}
//                                 onClick={() => handleSeatClick(seatId)}
//                                 disabled={isOccupied}
//                                 className={`h-14 rounded-lg font-bold text-sm flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
//                                   isSelected
//                                     ? "bg-green-500 text-white shadow-xl scale-110 ring-4 ring-green-300"
//                                     : isOccupied
//                                     ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70"
//                                     : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-xl"
//                                 }`}
//                               >
//                                 <Seat size={20} weight="fill" />
//                                 <span className="text-xs mt-0.5">{seatId}</span>
//                               </button>
//                             );
//                           })}

//                           {/* Aisle */}
//                           <div className="flex items-center justify-center h-14">
//                             <div className="w-full h-1 bg-gray-300 rounded"></div>
//                           </div>

//                           {/* Right Seats (C & D) */}
//                           {['C', 'D'].map((letter) => {
//                             const seatId = `${letter}${rowNumber}`;
//                             const isOccupied = occupiedSeats.includes(seatId);
//                             const isSelected = selectedSeat === seatId;
                            
//                             return (
//                               <button
//                                 key={seatId}
//                                 onClick={() => handleSeatClick(seatId)}
//                                 disabled={isOccupied}
//                                 className={`h-14 rounded-lg font-bold text-sm flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
//                                   isSelected
//                                     ? "bg-green-500 text-white shadow-xl scale-110 ring-4 ring-green-300"
//                                     : isOccupied
//                                     ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70"
//                                     : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-xl"
//                                 }`}
//                               >
//                                 <Seat size={20} weight="fill" />
//                                 <span className="text-xs mt-0.5">{seatId}</span>
//                               </button>
//                             );
//                           })}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Bus Back */}
//                   <div className="mt-4 bg-gray-700 rounded-lg p-2 text-center">
//                     <Text as="p" className="text-white text-xs font-semibold">BACK OF BUS</Text>
//                   </div>
//                 </div>

//                 {/* Legend */}
//                 <div className="flex justify-center gap-4 md:gap-6 flex-wrap mt-6">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded shadow"></div>
//                     <Text as="span" className="text-sm font-semibold">Available</Text>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-gray-800 rounded shadow"></div>
//                     <Text as="span" className="text-sm font-semibold">Occupied</Text>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-green-500 rounded shadow"></div>
//                     <Text as="span" className="text-sm font-semibold">Selected</Text>
//                   </div>
//                 </div>

//                 {selectedSeat && (
//                   <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center mt-6">
//                     <CheckCircle size={40} weight="fill" className="text-green-600 mx-auto mb-2" />
//                     <Text as="p" className="text-xl font-bold text-green-800">
//                       Seat {selectedSeat} Selected
//                     </Text>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="flex flex-col md:flex-row gap-3 mt-6">
//                   <Button
//                     type="button"
//                     onClick={handlePayment}
//                     className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
//                   >
//                     <CreditCard size={24} weight="duotone" />
//                     Proceed to Payment
//                   </Button>
                  
//                   <Button
//                     type="button"
//                     onClick={handleCancel}
//                     className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all hover:bg-red-700 flex items-center justify-center gap-2"
//                   >
//                     <XCircle size={24} weight="duotone" />
//                     Cancel
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </Fade>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Confirmation;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Bus, User, IdentificationCard, Envelope, Phone, GenderIntersex,
  MapPin, Clock, CurrencyCircleDollar, Seat, CheckCircle, XCircle,
  ArrowLeft, CreditCard
} from "@phosphor-icons/react";
import { Button } from "../atoms/Button";
import { Text } from "../atoms/Text";
import { Fade } from "react-awesome-reveal";
import toast from "react-hot-toast";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { departure, destination, date, departureTime, arrivalTime, ticket } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cniKit: "",
    gender: "",
    civility: "",
    email: "",
    phone: ""
  });

  const [confirmReservation, setConfirmReservation] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [showSeatMap, setShowSeatMap] = useState(false);

  const generateSeats = () => {
    const rows = ticket?.type === "vip" ? 8 : 10;
    const seats: { seat: string; position: 'left' | 'right' | 'aisle' }[] = [];
    
    for (let i = 1; i <= rows; i++) {
      seats.push({ seat: `A${i}`, position: 'left' });
      seats.push({ seat: `B${i}`, position: 'left' });
      seats.push({ seat: `aisle-${i}`, position: 'aisle' });
      seats.push({ seat: `C${i}`, position: 'right' });
      seats.push({ seat: `D${i}`, position: 'right' });
    }
    return seats;
  };

  const [occupiedSeats] = useState<string[]>(() => {
    const allSeats = generateSeats().filter(s => s.position !== 'aisle').map(s => s.seat);
    const numOccupied = Math.floor(allSeats.length * 0.3);
    const occupied: string[] = [];
    
    while (occupied.length < numOccupied) {
      const randomSeat = allSeats[Math.floor(Math.random() * allSeats.length)];
      if (!occupied.includes(randomSeat)) {
        occupied.push(randomSeat);
      }
    }
    return occupied;
  });

  const validateKitNumber = (kit: string): boolean => {
    const kitRegex = /^KIT\d{3}$/;
    return kitRegex.test(kit);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{9,12}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmClick = () => {
    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      toast.error("First name must be at least 2 characters");
      return;
    }
    
    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      toast.error("Last name must be at least 2 characters");
      return;
    }
    
    if (!validateKitNumber(formData.cniKit)) {
      toast.error("CNI KIT format must be KIT060 (KIT + 3 digits)");
      return;
    }
    
    if (!formData.gender) {
      toast.error("Please select your gender");
      return;
    }
    
    if (!formData.civility) {
      toast.error("Please select your civility");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number (e.g., +237612345678)");
      return;
    }

    setConfirmReservation(true);
    setShowSeatMap(true);
    toast.success("Information validated! Please select your seat.");
  };

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat)) {
      toast.error("This seat is already occupied!");
      return;
    }
    
    setSelectedSeat(seat);
    toast.success(`Seat ${seat} selected!`);
  };

  const handlePayment = () => {
    if (!selectedSeat) {
      toast.error("Please select a seat before proceeding to payment");
      return;
    }
    
    toast.success("Redirecting to payment...");
    setTimeout(() => {
      navigate("/pay", { 
        state: { 
          departure, 
          destination, 
          date, 
          departureTime, 
          arrivalTime,
          ticket,
          passengerInfo: formData,
          selectedSeat
        } 
      });
    }, 800);
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 mt-24">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <Text as="p" className="text-red-600 font-bold text-xl mb-4">
            No ticket selected
          </Text>
          <Button
            type="button"
            onClick={() => navigate("/")}
            className="bg-color2 text-white px-6 py-3 rounded-lg font-medium hover:bg-color3 transition-all"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isVIP = ticket.type === "vip";

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen mt-24 pb-12">
      <div className="bg-gradient-to-r from-color2 to-color3 text-white py-8 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-100 hover:text-white transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={22} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          <Text as="h1" className="text-4xl font-bold">
            Reservation Confirmation
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showSeatMap ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Ticket Info */}
            <Fade direction="left">
              <div className={`rounded-2xl shadow-2xl p-6 ${
                isVIP ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-yellow-400" : "bg-white border-2 border-gray-200"
              }`}>
                <Text as="h2" className="text-2xl font-bold mb-6 text-gray-800">
                  Ticket Information
                </Text>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Bus size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
                    <div>
                      <Text as="p" className="text-sm text-gray-600">Bus Company</Text>
                      <Text as="p" className={`font-bold ${isVIP ? "text-amber-900" : "text-gray-800"}`}>
                        {ticket.busName}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
                    <div>
                      <Text as="p" className="text-sm text-gray-600">Route</Text>
                      <Text as="p" className="font-bold text-gray-800">
                        {departure} → {destination}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
                    <div>
                      <Text as="p" className="text-sm text-gray-600">Departure Time</Text>
                      <Text as="p" className="font-bold text-gray-800">
                        {date} at {departureTime}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CurrencyCircleDollar size={24} weight="duotone" className={isVIP ? "text-amber-600" : "text-color2"} />
                    <div>
                      <Text as="p" className="text-sm text-gray-600">Price</Text>
                      <Text as="p" className={`text-2xl font-bold ${isVIP ? "text-amber-600" : "text-color2"}`}>
                        {ticket.price.toLocaleString()} FCFA
                      </Text>
                    </div>
                  </div>

                  {isVIP && (
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-4">
                      <CheckCircle size={20} weight="fill" />
                      <Text as="span" className="font-bold">VIP Class</Text>
                    </div>
                  )}
                </div>
              </div>
            </Fade>

            {/* Passenger Form */}
            <Fade direction="right">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-gray-200">
                <Text as="h2" className="text-2xl font-bold mb-6 text-gray-800">
                  Passenger Information
                </Text>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User size={16} weight="duotone" className="inline mr-1" />
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User size={16} weight="duotone" className="inline mr-1" />
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <IdentificationCard size={16} weight="duotone" className="inline mr-1" />
                      CNI KIT Number * (Format: KIT060)
                    </label>
                    <input
                      type="text"
                      name="cniKit"
                      value={formData.cniKit}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="KIT060"
                      maxLength={6}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Civility *
                      </label>
                      <select
                        name="civility"
                        value={formData.civility}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                      >
                        <option value="">Select</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <GenderIntersex size={16} weight="duotone" className="inline mr-1" />
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Envelope size={16} weight="duotone" className="inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone size={16} weight="duotone" className="inline mr-1" />
                      Phone Number * (e.g., +237612345678)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2"
                      placeholder="+237612345678"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mt-6">
                    <Text as="p" className="text-sm font-semibold text-gray-800 mb-3">
                      Do you want to proceed with this reservation?
                    </Text>
                    <Button
                      type="button"
                      onClick={handleConfirmClick}
                      className="w-full py-3 rounded-lg font-bold text-white transition-all bg-color2 hover:bg-color3 shadow-lg hover:shadow-xl"
                    >
                      Yes, Confirm Information
                    </Button>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        ) : (
          <Fade>
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-gray-200 max-w-2xl mx-auto">
              <Text as="h2" className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
                Select Your Seat
              </Text>

              <div>
                <div className="bg-gradient-to-b from-gray-800 to-gray-700 rounded-t-3xl p-4 mb-2">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-600">
                      <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                    </div>
                    <Text as="p" className="text-white font-bold text-lg">DRIVER</Text>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-blue-100 to-blue-50 border-4 border-gray-700 rounded-b-3xl p-4 md:p-6">
                  <div className="space-y-3">
                    {Array.from({ length: ticket.type === "vip" ? 8 : 10 }).map((_, rowIndex) => {
                      const rowNumber = rowIndex + 1;
                      return (
                        <div key={rowNumber} className="grid grid-cols-5 gap-2 items-center">
                          {['A', 'B'].map((letter) => {
                            const seatId = `${letter}${rowNumber}`;
                            const isOccupied = occupiedSeats.includes(seatId);
                            const isSelected = selectedSeat === seatId;
                            
                            return (
                              <button
                                key={seatId}
                                onClick={() => handleSeatClick(seatId)}
                                disabled={isOccupied}
                                className={`h-14 rounded-lg font-bold text-sm flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                                  isSelected
                                    ? "bg-green-500 text-white shadow-xl scale-110 ring-4 ring-green-300"
                                    : isOccupied
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70"
                                    : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-xl"
                                }`}
                              >
                                <Seat size={20} weight="fill" />
                                <span className="text-xs mt-0.5">{seatId}</span>
                              </button>
                            );
                          })}

                          <div className="flex items-center justify-center h-14">
                            <div className="w-full h-1 bg-gray-300 rounded"></div>
                          </div>

                          {['C', 'D'].map((letter) => {
                            const seatId = `${letter}${rowNumber}`;
                            const isOccupied = occupiedSeats.includes(seatId);
                            const isSelected = selectedSeat === seatId;
                            
                            return (
                              <button
                                key={seatId}
                                onClick={() => handleSeatClick(seatId)}
                                disabled={isOccupied}
                                className={`h-14 rounded-lg font-bold text-sm flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                                  isSelected
                                    ? "bg-green-500 text-white shadow-xl scale-110 ring-4 ring-green-300"
                                    : isOccupied
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70"
                                    : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-xl"
                                }`}
                              >
                                <Seat size={20} weight="fill" />
                                <span className="text-xs mt-0.5">{seatId}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 bg-gray-700 rounded-lg p-2 text-center">
                    <Text as="p" className="text-white text-xs font-semibold">BACK OF BUS</Text>
                  </div>
                </div>

                <div className="flex justify-center gap-4 md:gap-6 flex-wrap mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded shadow"></div>
                    <Text as="span" className="text-sm font-semibold">Available</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-800 rounded shadow"></div>
                    <Text as="span" className="text-sm font-semibold">Occupied</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded shadow"></div>
                    <Text as="span" className="text-sm font-semibold">Selected</Text>
                  </div>
                </div>

                {selectedSeat && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center mt-6">
                    <CheckCircle size={40} weight="fill" className="text-green-600 mx-auto mb-2" />
                    <Text as="p" className="text-xl font-bold text-green-800">
                      Seat {selectedSeat} Selected
                    </Text>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={handlePayment}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={24} weight="duotone" />
                    Proceed to Payment
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle size={24} weight="duotone" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Fade>
        )}
      </div>
    </div>
  );
};

export default Confirmation;







