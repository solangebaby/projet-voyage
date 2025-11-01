import { Image } from "../atoms/Image"
import bgImage from "../../assets/HeroVector.png"
import heroImage from "../../assets/girl.png"
import { Text } from "../atoms/Text"
import { HeroTexts } from "../particles/DataLists"
import { Button } from "../atoms/Button"
import { Bus, ArrowDown } from "@phosphor-icons/react"
import { Fade, Slide } from "react-awesome-reveal"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const destinations = [
  { city: "Douala" },
  { city: "Yaoundé" },
  { city: "Bafoussam" },
  { city: "Buea" },
  { city: "Ngaoundéré" },
  { city: "Bertoua" },
]

const hours = [
  "05:00", "06:00", "07:00", "08:00", "09:00",
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00"
]

const HeroSection = () => {
  const navigate = useNavigate()

  const [departure, setDeparture] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [arrivalTime, setArrivalTime] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const handleReserve = () => {
    if (!departure || !destination || !date || !departureTime || !arrivalTime) {
      toast.error("Please fill in all fields before booking.")
      return
    }

    if (departure === destination) {
      toast.error("Departure and destination must be different.")
      return
    }

    if (arrivalTime <= departureTime) {
      toast.error("Arrival time must be after departure time.")
      return
    }

    toast.success("Searching for available tickets...")
    setTimeout(() => {
      navigate("/ticket-details", { state: { departure, destination, date, departureTime, arrivalTime } })
    }, 800)
  }

  return (
    <section className="w-full lg:h-screen md:h-[600px] h-[850px] relative overflow-hidden flex justify-end">
      {/* Background */}
      <Image
        className="h-[60%] w-[80%] lg:h-[90vh] md:h-[50vh] lg:w-1/2 md:w-[55%]"
        image={bgImage}
        alt="Hero Background Vector"
      />

      {/* Main content */}
      <main className="w-full lg:h-full h-auto grid md:grid-cols-2 absolute top-0 left-0 lg:px-24 md:px-8 px-5">
        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-center items-start gap-6 md:order-1 order-2 relative lg:left-10 mt-16 md:mt-24 lg:mt-32">
          {/* Hero Text */}
          <div className="flex flex-col gap-3 max-w-lg">
            <Text as="p" className="text-color1 uppercase tracking-widest lg:text-base text-sm font-normal">
              <Fade>{HeroTexts.firstText}</Fade>
            </Text>

            <Text as="h1" className="text-color3 lg:text-6xl md:text-5xl text-3xl font-semibold leading-tight">
              <Fade>{HeroTexts.secondText}</Fade>
            </Text>

            <Text as="p" className="text-color3 md:text-base text-sm text-justify font-light">
              <Fade>{HeroTexts.thirdText}</Fade>
            </Text>
          </div>

          {/* Bus icon + text + arrow */}
          <div className="flex items-center gap-3 mt-2">
            <div className="relative flex h-12 w-12">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color1 opacity-75"></span>
              <span className="relative flex justify-center items-center text-white rounded-full h-12 w-12 bg-color1">
                <Bus size={22} color="currentColor" weight="fill" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Text as="p" className="text-sm text-gray-700 font-medium">Choose your trip below</Text>
              <ArrowDown size={20} weight="bold" color="#000000" className="animate-bounce" />
            </div>
          </div>

          {/* FORM (horizontal) */}
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg p-3 w-full max-w-2xl mt-3">
            <select
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-[100px]"
            >
              <option value="">From</option>
              {destinations.map((d, i) => (
                <option key={i} value={d.city}>{d.city}</option>
              ))}
            </select>

            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-[90px]"
            >
              <option value="">To</option>
              {destinations
                .filter((d) => d.city !== departure)
                .map((d, i) => (
                  <option key={i} value={d.city}>{d.city}</option>
                ))}
            </select>

            <select
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-[100px]"
            >
              <option value="">Depart</option>
              {hours.map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>

            <select
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-[80px]"
            >
              <option value="">Arrive</option>
              {hours.filter(h => h > departureTime).map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>

            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-[160px]"
            />

            <Button
              type="button"
              onClick={handleReserve}
              className="bg-color2 text-white px-3 py-2 rounded-lg text-sm font-medium transition-transform duration-200 hover:scale-105 hover:bg-color3 w-[100px] flex justify-center items-center"
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col items-center justify-end md:order-2 order-1">
          <Slide direction="right">
            <Image
              image={heroImage}
              alt="Hero Image"
              className="lg:h-[85%] lg:w-[92%] md:h-[100%] md:w-full w-[90%] h-[50vh]"
            />
          </Slide>
        </div>
      </main>
    </section>
  )
}



 export default HeroSection