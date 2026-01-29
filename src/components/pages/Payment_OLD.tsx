
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../atoms/Button";
import { Text } from "../atoms/Text";
import { Fade } from "react-awesome-reveal";
import { 
  Phone, 
  Money, 
  ArrowLeft, 
  CheckCircle, 
  WarningCircle
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    departure,
    destination,
    date,
    departureTime,
    arrivalTime,
    ticket,
    passengerInfo,
    selectedSeat
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<string>("MTN");

  const handlePayment = () => {
    toast.loading("Processing payment...");

    // ✅ Simulated call to NotPay API
    setTimeout(() => {
      toast.dismiss();
      toast.success("Payment successful!");

      navigate("/ticket", {
        state: {
          ticket,
          departure,
          destination,
          date,
          departureTime,
          arrivalTime,
          passengerInfo,
          selectedSeat,
          transactionId: "NOTPAY-" + Math.floor(Math.random() * 999999)
        },
      });
    }, 2000);
  };

  const handleCancelRefund = () => {
    toast.loading("Processing refund...");

    setTimeout(() => {
      toast.dismiss();
      toast.success("Refund completed! ✅ Money returned to wallet");
      navigate("/");
    }, 2000);
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-24">
        <Text as="p" className="text-red-600 font-bold">No reservation found</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-24 bg-gradient-to-br from-indigo-50 to-purple-100 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-color2 to-color3 text-white p-6 shadow-xl">
        <button className="flex gap-2 items-center"
          onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
          <span>Back</span>
        </button>
        <Text as="h1" className="text-3xl font-bold mt-2">Payment & Confirmation</Text>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-8">

        {/* Reservation Summary */}
        <Fade>
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2">
            <Text as="h2" className="text-xl font-bold mb-4">Reservation Summary</Text>
            <div className="space-y-2 text-gray-700">
              <p><strong>Passenger:</strong> {passengerInfo.firstName} {passengerInfo.lastName}</p>
              <p><strong>Route:</strong> {departure} → {destination}</p>
              <p><strong>Date:</strong> {date} at {departureTime}</p>
              <p><strong>Seat:</strong> {selectedSeat}</p>
              <p><strong>Price:</strong> {ticket.price.toLocaleString()} FCFA</p>
            </div>
          </div>
        </Fade>

        {/* Payment Method */}
        <Fade delay={200}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2">
            <Text as="h2" className="text-xl font-bold mb-4">Choose Payment Method</Text>

            <div className="space-y-3">
              {["MTN", "Orange"].map((network) => (
                <label
                  key={network}
                  className={`border-2 rounded-xl p-4 flex justify-between items-center cursor-pointer ${
                    paymentMethod === network 
                      ? "border-color3 bg-purple-50" 
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod(network)}
                >
                  <div className="flex items-center gap-3">
                    <Phone size={22} />
                    <span className="font-semibold">{network} Mobile Money</span>
                  </div>
                  {paymentMethod === network && (
                    <CheckCircle size={24} weight="fill" className="text-color3" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </Fade>

        {/* Payment Buttons */}
        <Fade delay={300}>
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              type="button"
              onClick={handlePayment}
              className="bg-color2 w-full py-3 rounded-lg text-white font-bold hover:bg-color3 shadow-lg"
            >
              Pay {ticket.price.toLocaleString()} FCFA
            </Button>

            <Button
              type="button"
              onClick={handleCancelRefund}
              className="bg-red-600 w-full py-3 rounded-lg text-white font-bold hover:bg-red-700 shadow-lg"
            >
              Cancel & Refund
            </Button>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default Payment;
////////////////////////////////////////////////////////////////
// src/pages/Payment.tsx

// import { useLocation, useNavigate } from "react-router-dom"
// import { useState } from "react"
// import { Button } from "../atoms/Button"
// import { Text } from "../atoms/Text"
// import { Phone, ArrowLeft, CheckCircle } from "@phosphor-icons/react"
// import toast from "react-hot-toast"
// import { 
//   createPassenger, 
//   createReservation, 
//   initiatePayment, 
//   createTicket,
//   PassengerInput,
//   Ticket
// } from "../../services/api"

// interface TicketInfo {
//   id: number
//   tripCode: string
//   busName: string
//   type: 'standard' | 'vip'
//   price: number
//   availableSeats: number
//   features: string[]
// }

// interface LocationState {
//   departure: string
//   destination: string
//   date: string
//   departureTime: string
//   arrivalTime: string
//   ticket: TicketInfo
//   passengerInfo: PassengerInput
//   selectedSeat: string
// }

// type PaymentMethod = "MTN" | "Orange"

// const Payment = (): JSX.Element => {
//   const location = useLocation()
//   const navigate = useNavigate()

//   const state = location.state as LocationState
//   const {
//     departure,
//     destination,
//     date,
//     departureTime,
//     arrivalTime,
//     ticket,
//     passengerInfo,
//     selectedSeat
//   } = state || {}

//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MTN")
//   const [phoneNumber, setPhoneNumber] = useState<string>("")
//   const [processing, setProcessing] = useState<boolean>(false)

//   const handlePayment = async (): Promise<void> => {
//     if (!phoneNumber || phoneNumber.length < 9) {
//       toast.error("Please enter a valid phone number")
//       return
//     }

//     if (!ticket || !passengerInfo || !selectedSeat) {
//       toast.error("Missing information")
//       return
//     }

//     setProcessing(true)
//     const loadingToast = toast.loading("Processing payment...")

//     try {
//       // 1. Créer le passager
//       toast.loading("Creating passenger account...", { id: loadingToast })
//       const passenger = await createPassenger(passengerInfo)

//       // 2. Créer la réservation
//       toast.loading("Creating reservation...", { id: loadingToast })
//       const reservation = await createReservation({
//         tripId: ticket.id,
//         passengerId: passenger.id!,
//         selectedSeat: selectedSeat
//       })

//       // 3. Initier le paiement
//       toast.loading("Initiating payment...", { id: loadingToast })
//       const payment = await initiatePayment({
//         reservationId: reservation.id!,
//         method: paymentMethod,
//         phoneNumber: phoneNumber
//       })

//       // 4. Simuler la vérification du paiement
//       toast.loading("Verifying payment...", { id: loadingToast })
      
//       setTimeout(async () => {
//         try {
//           // En production: webhook NotchPaid
//           // Pour démo: simuler succès
//           const paymentSuccess = true

//           if (paymentSuccess) {
//             // 5. Générer le ticket
//             const generatedTicket: Ticket = await createTicket(reservation.id!)

//             toast.dismiss(loadingToast)
//             toast.success("Payment successful! Generating your ticket...")

//             // Préparer données ticket
//             const ticketData: Ticket = {
//               ...generatedTicket,
//               passengerName: `${passenger.first_name} ${passenger.last_name}`,
//               cniNumber: passenger.cni_number,
//               departure: departure,
//               destination: destination,
//               date: date,
//               departureTime: departureTime,
//               arrivalTime: arrivalTime,
//               seat: selectedSeat,
//               price: ticket.price,
//               busName: ticket.busName
//             }

//             // Rediriger vers page ticket
//             setTimeout(() => {
//               navigate("/ticket", {
//                 state: {
//                   ticket: ticketData,
//                   passenger: passenger,
//                   reservation: reservation
//                 }
//               })
//             }, 1000)

//           } else {
//             toast.dismiss(loadingToast)
//             toast.error("Payment failed! Please try again.")
//             setProcessing(false)
//           }

//         } catch (error) {
//           toast.dismiss(loadingToast)
//           toast.error("Payment verification failed!")
//           console.error(error)
//           setProcessing(false)
//         }
//       }, 3000)

//     } catch (error: any) {
//       toast.dismiss(loadingToast)
//       setProcessing(false)
      
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message)
//       } else {
//         toast.error("Payment failed! Please try again.")
//       }
//       console.error("Payment error:", error)
//     }
//   }

//   if (!ticket || !passengerInfo || !selectedSeat) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 mt-24">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
//           <Text as="p" className="text-red-600 font-bold text-xl mb-4">
//             Missing payment information
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
//     )
//   }

//   return (
//     <div className="min-h-screen mt-24 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="bg-gradient-to-r from-color2 to-color3 text-white p-6 shadow-xl">
//         <button 
//           onClick={() => navigate(-1)} 
//           className="flex gap-2 items-center mb-2" 
//           disabled={processing}
//         >
//           <ArrowLeft size={22} /> Back
//         </button>
//         <Text as="h1" className="text-3xl font-bold">Payment</Text>
//       </div>

//       <div className="max-w-4xl mx-auto px-6 pt-8 pb-12 space-y-6">
        
//         {/* Résumé Passager */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
//           <Text as="h2" className="text-xl font-bold mb-4 flex items-center gap-2">
//             <CheckCircle size={24} className="text-green-600" />
//             Passenger Information
//           </Text>
//           <div className="space-y-2 text-gray-700">
//             <p><strong>Name:</strong> {passengerInfo.firstName} {passengerInfo.lastName}</p>
//             <p><strong>CNI:</strong> {passengerInfo.cniKit}</p>
//             <p><strong>Email:</strong> {passengerInfo.email}</p>
//             <p><strong>Phone:</strong> {passengerInfo.phone}</p>
//           </div>
//         </div>

//         {/* Résumé Voyage */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
//           <Text as="h2" className="text-xl font-bold mb-4">Trip Details</Text>
//           <div className="space-y-2 text-gray-700">
//             <p><strong>Route:</strong> {departure} → {destination}</p>
//             <p><strong>Date:</strong> {date}</p>
//             <p><strong>Time:</strong> {departureTime} - {arrivalTime}</p>
//             <p><strong>Seat:</strong> {selectedSeat}</p>
//             <p><strong>Bus:</strong> {ticket.busName}</p>
//             <p className="text-2xl font-bold text-color2 mt-4">{ticket.price.toLocaleString()} FCFA</p>
//           </div>
//         </div>

//         {/* Méthode de Paiement */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
//           <Text as="h2" className="text-xl font-bold mb-4">Payment Method</Text>

//           <div className="space-y-3">
//             {(["MTN", "Orange"] as PaymentMethod[]).map(method => (
//               <label
//                 key={method}
//                 className={`border-2 p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all ${
//                   paymentMethod === method 
//                     ? "bg-purple-50 border-color3 shadow-md" 
//                     : "border-gray-300 hover:border-gray-400"
//                 } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => !processing && setPaymentMethod(method)}
//               >
//                 <div className="flex items-center gap-3">
//                   <Phone size={22} />
//                   <span className="font-semibold">{method} Mobile Money</span>
//                 </div>
//                 {paymentMethod === method && (
//                   <CheckCircle size={24} weight="fill" className="text-color3" />
//                 )}
//               </label>
//             ))}
//           </div>

//           <div className="mt-4">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Phone Number *
//             </label>
//             <input
//               type="tel"
//               placeholder="+237612345678"
//               className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2 disabled:opacity-50"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               disabled={processing}
//             />
//           </div>
//         </div>

//         {/* Bouton Paiement */}
//         <Button
//           type="button"
//           disabled={processing}
//           onClick={handlePayment}
//           className="bg-color2 w-full py-4 rounded-lg text-white font-bold text-lg hover:bg-color3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//         >
//           {processing ? "Processing..." : `Pay ${ticket.price.toLocaleString()} FCFA`}
//         </Button>

//         {processing && (
//           <div className="text-center text-sm text-gray-600">
//             <p>Please do not close this window...</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Payment