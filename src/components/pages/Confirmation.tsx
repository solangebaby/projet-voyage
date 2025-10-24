// src/pages/Confirmation.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    ticket: any;
    departure: string;
    destination: string;
    date: string;
    name: string;
  } | undefined;

  useEffect(() => {
    if (!state || !state.ticket) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state || !state.ticket) {
    return <p>Chargement...</p>;
  }

  const { ticket, departure, destination, date, name } = state;

  // Contenu du QR code (tu peux ajouter plus d’infos si besoin)
  const qrValue = JSON.stringify({
    name,
    departure,
    destination,
    date,
    bus: ticket.name,
    time: ticket.time,
    price: ticket.price
  });

  const handleDownloadQR = () => {
    const canvas = document.getElementById("ticket-qr") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
    //   a.download = ${name}_ticket.png;
      a.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Réservation Confirmée</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col items-center gap-4">
        <p><strong>Nom :</strong> {name}</p>
        <p><strong>Itinéraire :</strong> {departure} → {destination}</p>
        <p><strong>Date :</strong> {date}</p>
        <p><strong>Bus :</strong> {ticket.name}</p>
        <p><strong>Heure :</strong> {ticket.time}</p>
        <p><strong>Prix :</strong> ${ticket.price}</p>
        <p className="text-green-600 font-semibold mt-4">Votre réservation est confirmée !</p>

        <QRCodeCanvas id="ticket-qr" value={qrValue} size={200} className="mt-4" />

        <button
          onClick={handleDownloadQR}
          className="bg-yellow-500 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 mt-4"
        >
          Télécharger le QR code
        </button>
      </div>
    </div>
  );
};

export default Confirmation;