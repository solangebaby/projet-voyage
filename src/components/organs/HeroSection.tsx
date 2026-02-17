import { Image } from "../atoms/Image"
import bgImage from "../../assets/HeroVector.png"
import heroImage from "../../assets/girl.png"
import { Text } from "../atoms/Text"
import { HeroTexts } from "../particles/DataLists"
import { Button } from "../atoms/Button"
import { Bus, ArrowDown } from "@phosphor-icons/react"
import { Fade, Slide } from "react-awesome-reveal"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { getDestinations, searchTrips, Destination, Trip } from "../../services/api"

const HeroSection = () => {
  const navigate = useNavigate()

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [departure, setDeparture] = useState<string>("")
  const [destination, setDestination] = useState<string>("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(true)

  const today = new Date().toISOString().split("T")[0]

  // Load destinations from database
  useEffect(() => {
    const loadDestinations = async () => {
      setLoadingCities(true)
      try {
        const cities = await getDestinations()
        setDestinations(cities)
        if (cities.length === 0) {
          toast.error("No cities available. Please contact support.")
        }
      } catch (error: any) {
        console.error("Error loading destinations:", error)
        toast.error(error.message || "Failed to load destinations")
      } finally {
        setLoadingCities(false)
      }
    }

    loadDestinations()
  }, [])

  const handleReserve = async () => {
    // Validation: All fields must be filled
    if (!departure) {
      toast.error("Please select a departure city")
      return
    }

    if (!destination) {
      toast.error("Please select an arrival city")
      return
    }

    if (!date) {
      toast.error("Please select a travel date")
      return
    }

    if (departure === destination) {
      toast.error("Departure and destination must be different")
      return
    }

    // All validations passed - proceed to search
    setLoading(true)
    const loadingToast = toast.loading("Searching for available trips...")

    try {
      // Recherche des trajets via API REST
      const trips: Trip[] = await searchTrips({
        departure,
        destination,
        date
      })

      toast.dismiss(loadingToast)

      if (trips.length === 0) {
        toast.error("No trips available for the selected criteria. Please try different dates or destinations.")
        setLoading(false)
        return
      }

      toast.success(`Found ${trips.length} available trip(s)!`)
      
      // Get city names for display
      const departureCity = destinations.find(d => d.id.toString() === departure)?.city_name || "Unknown";
      const destinationCity = destinations.find(d => d.id.toString() === destination)?.city_name || "Unknown";
      
      setTimeout(() => {
        navigate("/ticket-details", { 
          state: { 
            trips,
            departure: departureCity, 
            destination: destinationCity, 
            date
          } 
        })
        setLoading(false)
      }, 500)

    } catch (error: any) {
      toast.dismiss(loadingToast)
      setLoading(false)
      console.error("Search error:", error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to search trips. Please try again.")
      }
    }
  }

  return (
    <section className="w-full min-h-screen lg:h-screen relative overflow-hidden py-20">
      {/* Background */}
      <Image
        className="h-[70%] w-[50%] lg:h-[85%] lg:w-[45%] md:h-[60%] md:w-[50%] absolute right-0 top-0 -z-10"
        image={bgImage}
        alt="Hero Background Vector"
      />

      <main className="container mx-auto h-full grid md:grid-cols-2 grid-cols-1 gap-8 px-6 lg:px-12 items-center">
        <div className="flex flex-col justify-center items-start gap-4 md:order-1 order-2">
          <div className="flex flex-col gap-2 max-w-lg w-full">
            <Fade>
              <Text as="p" className="text-color1 uppercase tracking-widest lg:text-base md:text-sm text-xs font-normal">
                {HeroTexts.firstText}
              </Text>
            </Fade>

            <Fade>
              <Text as="h1" className="text-color3 lg:text-6xl md:text-4xl text-3xl font-semibold lg:leading-tight md:leading-tight leading-snug">
                {HeroTexts.secondText}
              </Text>
            </Fade>

            <Fade>
              <Text as="p" className="text-color3 md:text-base text-sm lg:text-left text-justify font-light mt-1">
                {HeroTexts.thirdText}
              </Text>
            </Fade>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="relative flex lg:h-12 lg:w-12 h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color1 opacity-75"></span>
              <span className="relative flex justify-center items-center text-white rounded-full lg:h-12 lg:w-12 h-10 w-10 bg-color1">
                <Bus size={20} color="currentColor" weight="fill" className="lg:w-[22px] lg:h-[22px]" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Text as="p" className="lg:text-sm text-xs text-gray-700 font-medium">Choose your trip below</Text>
              <ArrowDown size={18} weight="bold" color="#000000" className="animate-bounce lg:w-5 lg:h-5" />
            </div>
          </div>

          {/* FORMULAIRE SIMPLIFIÉ (SANS HEURES) */}
          <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-2xl mt-3">
            {loadingCities ? (
              <div className="flex items-center justify-center w-full py-3 gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-color2"></div>
                <span className="text-sm text-gray-600">Loading cities...</span>
              </div>
            ) : (
              <>
                {/* Desktop/Tablet: horizontal */}
                <div className="hidden md:flex items-center gap-3 flex-wrap">
                  <select
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    disabled={loading || loadingCities}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 flex-1 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">From</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.city_name}</option>
                    ))}
                  </select>

                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={loading || loadingCities}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 flex-1 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">To</option>
                    {destinations
                      .filter((d) => d.id.toString() !== departure)
                      .map((d) => (
                        <option key={d.id} value={d.id}>{d.city_name}</option>
                      ))}
                  </select>

                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={loading || loadingCities}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 flex-1 min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  <Button
                    type="button"
                    onClick={handleReserve}
                    disabled={loading || loadingCities}
                    className="bg-color2 text-white px-6 py-2 rounded-lg text-sm font-medium transition-transform duration-200 hover:scale-105 hover:bg-color3 whitespace-nowrap flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>

                {/* Mobile: vertical */}
                <div className="flex md:hidden flex-col gap-3">
                  <select
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    disabled={loading || loadingCities}
                    className="border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">From</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.city_name}</option>
                    ))}
                  </select>

                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={loading || loadingCities}
                    className="border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">To</option>
                    {destinations
                      .filter((d) => d.id.toString() !== departure)
                      .map((d) => (
                        <option key={d.id} value={d.id}>{d.city_name}</option>
                      ))}
                  </select>

                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={loading || loadingCities}
                    className="border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  <Button
                    type="button"
                    onClick={handleReserve}
                    disabled={loading || loadingCities}
                    className="bg-color2 text-white px-4 py-3 rounded-lg text-sm font-medium transition-transform duration-200 hover:scale-105 hover:bg-color3 w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Searching..." : "Search Trips"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end md:order-2 order-1">
          <Slide direction="right">
            <Image
              image={heroImage}
              alt="Hero Image"
              className="w-full max-w-[180px] lg:max-w-[240px] md:max-w-[210px] h-auto object-contain"
            />
          </Slide>
        </div>
      </main>
    </section>
  )
}

export default HeroSection
