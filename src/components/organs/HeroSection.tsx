import { Image } from "../atoms/Image"
import bgImage from "../../assets/HeroVector.png"
import heroImage from "../../assets/girl.png"
import { Text } from "../atoms/Text"
import { HeroTexts } from "../particles/DataLists"
import { Button } from "../atoms/Button"
import { Bus} from "@phosphor-icons/react"
import { Fade, Slide } from "react-awesome-reveal"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const destinations = [
  { ville: "Douala" },
  { ville: "Yaoundé" },
  { ville: "Bafoussam" },
  { ville: "Buea" },
  { ville: "Ngaoundéré" },
  { ville: "Bertoua" },
]

const HeroSection = () => {
  const navigate = useNavigate()

  const [departure, setDeparture] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")

  const handleReserve = () => {
    if (!departure || !destination || !date) {
      toast.error("Veuillez remplir tous les champs avant de réserver.")
      return
    }

    if (departure === destination) {
      toast.error("La ville de départ et la destination doivent être différentes.")
      return
    }

    toast.success("Recherche des tickets disponibles...")
    setTimeout(() => {
      navigate("/ticket-details", { state: { departure, destination, date } })
    }, 1000)
  }

  return (
    <section className="w-full lg:h-screen md:h-[550px] h-[830px] relative overflow-x-hidden flex justify-end">
      {/* Image de fond */}
      <Image
        className="h-[60%] w-[80%] lg:h-[90vh] md:h-[50vh] lg:w-1/2 md:w-[55%]"
        image={bgImage}
        alt="Hero Background Vector"
      />

      {/* Contenu principal */}
      <main className="w-full lg:h-full h-auto grid md:grid-cols-2 absolute top-0 left-0 lg:px-24 md:px-8 px-5 pt-24 md:pt-32 lg:pt-0">
        
        {/* Texte et formulaire */}
        <div className="flex flex-col justify-center md:gap-6 gap-3 md:order-1 order-2">
          <Text as="p" className="text-color1 uppercase tracking-widest lg:text-base text-sm font-normal">
            <Fade>{HeroTexts.firstText}</Fade>
          </Text>

          <Text as="h1" className="text-color3 lg:text-7xl md:text-5xl text-3xl font-medium leading-tight">
            <Fade>{HeroTexts.secondText}</Fade>
          </Text>

          <Text as="p" className="text-color3 md:text-base text-sm text-justify font-light mb-4">
            <Fade>{HeroTexts.thirdText}</Fade>
          </Text>

          {/* Ligne contenant le bouton Play + le formulaire */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
            {/* Bouton Play */}
            <div className="flex items-center gap-3 cursor-pointer">
              <Text as="span" className="relative flex h-14 w-14">
                <Text as="span" className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color1 opacity-75"></Text>
                <Text as="span" className="relative flex justify-center items-center text-white rounded-full h-14 w-14 bg-color1">
                  <Bus size={20} color="currentColor" weight="fill" />
                </Text>
              </Text>
            </div>

            {/* Formulaire de réservation */}
            <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row md:items-center gap-3">
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-color2"
              >
                <option value="">Départ</option>
                {destinations.map((d, i) => (
                  <option key={i} value={d.ville}>{d.ville}</option>
                ))}
              </select>

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-color2"
              >
                <option value="">Destination</option>
                {destinations
                  .filter((d) => d.ville !== departure)
                  .map((d, i) => (
                    <option key={i} value={d.ville}>{d.ville}</option>
                  ))}
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-color2"
              />

              <Button
                type="button"
                onClick={handleReserve}
                className="bg-color2 text-white px-4 py-2 rounded-lg font-medium hover:bg-color3 transition"
              >
                Réserver
              </Button>
            </div>
          </div>
        </div>

        {/* Image à droite */}
        <div className="flex flex-col items-center justify-end md:order-2 order-1">
          <Slide direction="right">
            <Image
              image={heroImage}
              alt="Hero Image"
              className="lg:h-[85%] lg:w-[90%] md:h-[100%] md:w-full w-[90%] h-[50vh]"
            />
          </Slide>
        </div>
      </main>
    </section>
  )
}

export default HeroSection