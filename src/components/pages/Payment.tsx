// src/pages/Payment.tsx
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