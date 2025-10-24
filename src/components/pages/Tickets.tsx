// src/pages/Tickets.tsx
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "../atoms/Button"

interface Ticket {
  id: number
  name: string
  price: number
  time: string
  seatsAvailable: number
}

const Tickets = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { departure, destination, date } = location.state || {}

  const [tickets] = useState<Ticket[]>([
    { id: 1, name: "Bus Express", price: 25, time: "08:00", seatsAvailable: 10 },
    { id: 2, name: "Bus VIP", price: 40, time: "09:30", seatsAvailable: 5 },
    { id: 3, name: "Bus Standard", price: 20, time: "11:00", seatsAvailable: 15 },
  ])

  const handleSelectTicket = (ticket: Ticket) => {
    // Navigation vers la page Payment avec les infos du ticket
    navigate("/payment", { state: { departure, destination, date, ticket } })
  }

  return (
    <div className="bg-gray-50 flex-grow p-4 md:p-8 mt-24">
      <h1 className="text-3xl font-bold mb-6">Tickets disponibles</h1>
      {departure && destination && date && (
        <p className="mb-6 text-gray-700">
          Voyage de <span className="font-medium">{departure}</span> à{" "}
          <span className="font-medium">{destination}</span> le{" "}
          <span className="font-medium">{date}</span>
        </p>
      )}

      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold">{ticket.name}</h2>
              <p>Heure : {ticket.time}</p>
              <p>Prix : ${ticket.price}</p>
              <p>Places disponibles : {ticket.seatsAvailable}</p>
            </div>
            <Button
              type="button"
              onClick={() => handleSelectTicket(ticket)}
              className="bg-color2 text-white mt-4 py-2 rounded-lg font-medium hover:bg-color3 transition"
            >
              Sélectionner
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tickets