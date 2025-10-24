// src/pages/Payment.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "../atoms/Button";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer le ticket sélectionné et la date depuis la navigation
  const state = location.state as { ticket: any; departure: string; destination: string; date: string } | undefined;

  // Redirection si aucun ticket sélectionné
  useEffect(() => {
    if (!state || !state.ticket) {
      navigate("paiement", { replace: true });
    }
  }, [state, navigate]);

  if (!state || !state.ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Aucun ticket sélectionné. Redirection...</p>
      </div>
    );
  }

  const { ticket, departure, destination, date } = state;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handlePayment = () => {
    if (!name || !email || !phone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Ici tu peux faire appel à ton backend ou JSON Server pour sauvegarder la réservation
    console.log({
      ticketId: ticket.id,
      departure,
      destination,
      date,
      name,
      email,
      phone,
      price: ticket.price,
    });

    toast.success("Paiement effectué !");
    navigate("/confirmation", { state: { ticket, departure, destination, date, name } });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Paiement</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4">
        <p>
          <strong>Itinéraire :</strong> {departure} → {destination}
        </p>
        <p>
          <strong>Date :</strong> {date}
        </p>
        <p>
          <strong>Nom du bus :</strong> {ticket.name}
        </p>
        <p>
          <strong>Heure :</strong> {ticket.time}
        </p>
        <p>
          <strong>Prix :</strong> ${ticket.price}
        </p>

        <input
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
        />

        <input
          type="tel"
          placeholder="Téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
        />

        <Button
          onClick={handlePayment}
          className="bg-yellow-500 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
        >
          Payer
        </Button>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </section>
  );
};

export default Payment;