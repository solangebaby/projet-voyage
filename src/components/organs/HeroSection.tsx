import bgImage from "../../assets/HeroVector.png"
import heroImage from "../../assets/girl.png"
import { Bus, ArrowDown } from "@phosphor-icons/react"
import { Fade, Slide } from "react-awesome-reveal"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"
import { getDestinations, Destination } from "../../services/api"

const HeroSection = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [departure, setDeparture] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [loadingCities, setLoadingCities] = useState(true)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const load = async () => {
      try {
        const cities = await getDestinations()
        setDestinations(cities)
      } catch {
        toast.error(t('hero.noCitiesLoaded'))
      } finally {
        setLoadingCities(false)
      }
    }
    load()
  }, [t])

  const handleSearch = () => {
    if (!departure) { toast.error(t('hero.selectDeparture')); return }
    if (!destination) { toast.error(t('hero.selectArrival')); return }
    if (!date || date < today) {
      toast.error(t('hero.selectValidDate'))
      return
    }
    if (departure === destination) { toast.error(t('hero.differentCities')); return }

    const depCity = destinations.find(d => d.id.toString() === departure)
    const destCity = destinations.find(d => d.id.toString() === destination)

    const params = new URLSearchParams({
      departure_id: departure,
      destination_id: destination,
      date: date,
      departure_name: depCity?.city_name || '',
      destination_name: destCity?.city_name || ''
    })
    navigate(`/tickets?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => e.preventDefault()

  // ✅ min-w réduit à [80px] pour éviter le débordement
  const selectClass = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 flex-1 min-w-0 disabled:opacity-50 bg-white"

  return (
    <section className="w-full min-h-screen lg:h-screen relative overflow-hidden flex items-center">
      <img
        className="h-[70%] w-[50%] lg:h-[85%] lg:w-[45%] md:h-[60%] md:w-[50%] absolute right-0 top-0 -z-10 object-cover"
        src={bgImage}
        alt="bg"
      />

      <main className="container mx-auto px-6 lg:px-12 h-full w-full">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-8 items-center h-full w-full">

          <div className="flex flex-col justify-center items-start md:order-1 order-2 w-full md:pl-6 lg:pl-10">

            <div className="w-full">
              <Fade triggerOnce direction="up" cascade damping={0.1}>
                <p className="text-color1 uppercase tracking-widest lg:text-base text-xs font-bold mb-3">
                  Marketplace Transport Cameroun
                </p>
                <h1 className="text-color3 lg:text-5xl md:text-4xl text-3xl font-semibold lg:leading-tight leading-snug max-w-xl">
                  {t('hero.title')}
                </h1>
              </Fade>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <div className="relative flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color1 opacity-75"></span>
                <span className="relative flex justify-center items-center text-white rounded-full h-10 w-10 bg-color1">
                  <Bus size={20} weight="fill" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 font-semibold">{t('hero.searchBtn')}</p>
                <ArrowDown size={18} weight="bold" className="animate-bounce text-color1" />
              </div>
            </div>

            {/* Formulaire de recherche */}
            <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-2xl mt-8 border border-gray-100/50">
              {loadingCities ? (
                <div className="flex items-center justify-center py-3 gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-color2" />
                  <span className="text-sm text-gray-500">{t('common.loading')}</span>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  {/* ✅ overflow-hidden empêche tout débordement du flex container */}
                  <div className="hidden md:flex items-center gap-2 overflow-hidden">
                    <select value={departure} onChange={e => setDeparture(e.target.value)} className={selectClass}>
                      <option value="">{t('hero.selectDeparture')}</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.city_name}</option>)}
                    </select>
                    <select value={destination} onChange={e => setDestination(e.target.value)} className={selectClass}>
                      <option value="">{t('hero.selectArrival')}</option>
                      {destinations.filter(d => d.id.toString() !== departure).map(d => <option key={d.id} value={d.id}>{d.city_name}</option>)}
                    </select>
                    {/* ✅ w-[130px] fixe pour l'input date afin d'éviter qu'il prenne trop de place */}
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-color2 w-[130px] shrink-0 cursor-pointer"
                    />
                    {/* ✅ shrink-0 empêche le bouton d'être compressé */}
                    <button
                      onClick={handleSearch}
                      className="bg-color2 hover:bg-color3 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 whitespace-nowrap shrink-0"
                    >
                      {t('hero.searchBtn')}
                    </button>
                  </div>

                  {/* Mobile */}
                  <div className="flex md:hidden flex-col gap-3">
                    <select value={departure} onChange={e => setDeparture(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full bg-white">
                      <option value="">{t('hero.selectDeparture')}</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.city_name}</option>)}
                    </select>
                    <select value={destination} onChange={e => setDestination(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full bg-white">
                      <option value="">{t('hero.selectArrival')}</option>
                      {destinations.filter(d => d.id.toString() !== departure).map(d => <option key={d.id} value={d.id}>{d.city_name}</option>)}
                    </select>
                    <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} onKeyDown={handleKeyDown} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full cursor-pointer bg-white" />
                    <button onClick={handleSearch} className="bg-color2 text-white px-4 py-3 rounded-lg text-sm font-bold w-full shadow-md">
                      {t('hero.searchBtn')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end md:order-2 order-1">
            <Slide direction="right" triggerOnce>
              <img
                src={heroImage}
                alt="Hero"
                className="w-full max-w-[180px] lg:max-w-[280px] md:max-w-[220px] h-auto object-contain drop-shadow-2xl"
              />
            </Slide>
          </div>
        </div>
      </main>
    </section>
  )
}

export default HeroSection