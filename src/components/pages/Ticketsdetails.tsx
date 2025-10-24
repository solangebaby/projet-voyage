import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Tickets from "../pages/Tickets"

const TicketDetails = () => {
  const location = useLocation() as {
    state: { departure: string; destination: string; date: string };
  };
  const navigate = useNavigate();
  const { departure, destination, date } = location.state || {};

  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (departure && destination) {
      axios.get("http://localhost:5000/tickets").then((res) => {
        const filtered = res.data.filter(
          (t: any) =>
            t.departure === departure && t.destination === destination
        );
        setTickets(filtered);
      });
    }
  }, [departure, destination]);

  const handleReserveTicket = (ticket: any) => {
    navigate("/payment", { state: { ticket, date } });
  };

  if (!departure || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Informations de recherche manquantes. Veuillez revenir à la page
          d'accueil.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Tickets disponibles
      </h1>

      {tickets.length === 0 ? (
        <p>Aucun ticket trouvé pour cet itinéraire.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border rounded-lg p-4 shadow flex justify-between items-center bg-white"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {ticket.departure} → {ticket.destination}
                </h2>
                <p>Heure : {ticket.time}</p>
                <p>Prix : {ticket.price} FCFA</p>
              </div>
              <button
                onClick={() => handleReserveTicket(ticket)}
                className="bg-yellow-500 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
              >
                Sélectionner
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default TicketDetails;