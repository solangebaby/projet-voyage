// src/components/pages/Cancel.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { cancelReservation } from "../../services/api";
import NavBar from "../organs/NavBar";
import Footer from "../organs/Footer";
import { XCircle, CheckCircle, ArrowLeft } from "@phosphor-icons/react";

const Cancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  
  const reservationId = searchParams.get("reservation_id");

  const handleCancelReservation = async () => {
    if (!reservationId) {
      toast.error("Reservation ID is missing");
      return;
    }

    setLoading(true);

    try {
      const response = await cancelReservation(parseInt(reservationId));

      if (response.success) {
        toast.success("Reservation cancelled successfully!");
        setCancelled(true);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/traveler/dashboard");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Cancellation error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to cancel reservation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {!cancelled ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <XCircle size={80} weight="duotone" className="text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                Cancel Reservation
              </h1>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-red-800 text-center mb-2 font-semibold">
                  Are you sure you want to cancel this reservation?
                </p>
                <p className="text-red-600 text-center text-sm">
                  This action cannot be undone. Your seat will be released and made available for other travelers.
                </p>
              </div>

              {/* Reservation Info */}
              {reservationId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-600 text-center">
                    <span className="font-semibold">Reservation ID:</span> {reservationId}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition duration-300 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft size={20} />
                  <span>Go Back</span>
                </button>
                
                <button
                  onClick={handleCancelReservation}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Cancelling...</span>
                  ) : (
                    <>
                      <XCircle size={20} weight="bold" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Need help? Contact our support team</p>
                <p className="mt-1">Email: support@kctrip.com | Phone: +237 123 456 789</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <CheckCircle size={80} weight="duotone" className="text-green-500" />
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                Reservation Cancelled
              </h1>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <p className="text-green-800 text-center mb-2 font-semibold">
                  Your reservation has been successfully cancelled.
                </p>
                <p className="text-green-600 text-center text-sm">
                  Your seat has been released and you will be redirected to your dashboard shortly.
                </p>
              </div>

              {/* Redirect Info */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">Redirecting to dashboard in 3 seconds...</p>
                <button
                  onClick={() => navigate("/traveler/dashboard")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                >
                  Go to Dashboard Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cancel;
