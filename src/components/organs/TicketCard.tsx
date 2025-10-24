import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../atoms/Button";

interface Ticket {
  id: number;
  departure: string;
  destination: string;
  price: number;
  time: string;
}

const Tickets = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { departure, destination } = location.state || {};
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (departure && destination) {
      axios.get('http:localhost:5000/tickets').then((res) => {
        const results = res.data.filter(
          (t: Ticket) =>
            t.departure === departure && t.destination === destination
        );
        setTickets(results);
      });
    }
  }, [departure, destination]);

  const handleReserve = (ticket: Ticket) => {
    navigate("/payment", { state: { ticket } });
  };

  return (
    <section className="p-8">
      <h1 className="text-3xl font-semibold text-blue-700 mb-6">
        Tickets disponibles
      </h1>
      {tickets.length === 0 ? (
        <p>Aucun ticket trouvé pour cet itinéraire.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border rounded-lg p-4 shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {ticket.departure} → {ticket.destination}
                </h2>
                <p>Heure : {ticket.time}</p>
                <p>Prix : {ticket.price} FCFA</p>
              </div>
              <Button
                onClick={() => handleReserve(ticket)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
              >
                Réserver
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Tickets;