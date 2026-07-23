import { useState, useEffect } from "react"
import { useNavigate, NavLink, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { authService } from "../../services/api"
import Logo from "../../assets/logo3.jpg"
import { ArrowCircleRight, CirclesFour } from "@phosphor-icons/react"
import { Slide } from "react-awesome-reveal"
import LanguageSwitcher from "../LanguageSwitcher"

const NavBar = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const user = authService.getUser()
  const isAuth = authService.isAuthenticated() && !!user

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = () => {
    authService.logout()
    navigate("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    if (user.role === "admin") return "/admin-dashboard"
    if (user.role === "agence") return "/agency-dashboard"
    return "/traveler-dashboard"
  }

  const navLinks = [
    { name: t('nav.home'), url: "/" },
    { name: t('nav.services'), url: "/#services" },
    { name: t('nav.destinations'), url: "/#destinations" },
    { name: t('nav.about'), url: "/#about" },
  ]

  const handleAnchorClick = (e: React.MouseEvent, url: string) => {
    if (url.startsWith("/#")) {
      e.preventDefault()
      if (location.pathname !== "/") {
        navigate("/")
        setTimeout(() => {
          const el = document.getElementById(url.replace("/#", ""))
          el?.scrollIntoView({ behavior: "smooth" })
        }, 300)
      } else {
        const el = document.getElementById(url.replace("/#", ""))
        el?.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const linkClass = "relative text-sm font-medium text-color3 hover:text-color2 transition-colors duration-200 pb-0.5 border-b-2 border-transparent hover:border-color2"

  return (
    <header className="w-full fixed z-50 top-0 left-0">
      <Slide direction="down" triggerOnce>
        <nav className={`w-full transition-all duration-300 ${scrolled || open ? "bg-white shadow-soft" : "bg-transparent"} lg:px-16 md:px-8 px-4`}>
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <img src={Logo} alt="Logo" className="h-12 w-auto object-contain rounded-lg" />
            </a>

            {/* Desktop nav — centered links aligned with logo height */}
            <div className="lg:flex hidden items-center gap-8 flex-1 justify-center">
              <ul className="flex items-center gap-7">
                {navLinks.map((link, i) => (
                  <li key={i}>
                    {link.url.startsWith("/#") ? (
                      <a href={link.url} onClick={e => handleAnchorClick(e, link.url)} className={linkClass}>
                        {link.name}
                      </a>
                    ) : (
                      <NavLink to={link.url} className={({ isActive }) =>
                        `${linkClass} ${isActive ? 'text-color2 border-color2' : ''}`
                      }>
                        {link.name}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop right side */}
            <div className="lg:flex hidden items-center gap-3 flex-shrink-0">
              <LanguageSwitcher />
              {isAuth ? (
                <>
                  <button
                    onClick={() => navigate(getDashboardLink())}
                    className="px-4 py-2 text-sm font-semibold text-color3 border-2 border-color3 rounded-xl hover:bg-color3 hover:text-white transition-all duration-200"
                  >
                    {user?.role === 'admin' ? t('nav.adminDashboard') : user?.role === 'agence' ? t('nav.agencyDashboard') : t('nav.travelerDashboard')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-semibold text-white bg-color1 hover:bg-color3 rounded-xl transition-all duration-200"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2 text-sm font-semibold text-white bg-color2 hover:bg-color3 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  {t('auth.login')}
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden flex items-center gap-3">
              <LanguageSwitcher />
              <button onClick={() => setOpen(!open)} className="text-color3 p-1">
                <CirclesFour size={28} weight="fill" />
              </button>
            </div>
          </div>
        </nav>
      </Slide>

      {/* Mobile overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-gray-950/80 transition-opacity duration-300 z-40 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out z-50 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <img src={Logo} alt="Logo" className="h-10 w-auto object-contain rounded" />
          <button onClick={() => setOpen(false)} className="text-color3 hover:text-color1 transition">
            <ArrowCircleRight size={26} weight="fill" />
          </button>
        </div>

        <ul className="flex flex-col px-5 py-6 gap-1">
          {navLinks.map((link, i) => (
            <li key={i}>
              {link.url.startsWith("/#") ? (
                <a href={link.url} onClick={e => { handleAnchorClick(e, link.url); setOpen(false) }}
                  className="block py-3 px-3 text-sm font-medium text-color3 hover:text-color2 hover:bg-gray-50 rounded-xl transition">
                  {link.name}
                </a>
              ) : (
                <NavLink to={link.url} onClick={() => setOpen(false)}
                  className="block py-3 px-3 text-sm font-medium text-color3 hover:text-color2 hover:bg-gray-50 rounded-xl transition">
                  {link.name}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        <div className="px-5 mt-auto pb-10 flex flex-col gap-3">
          {isAuth ? (
            <>
              <button onClick={() => { navigate(getDashboardLink()); setOpen(false) }}
                className="w-full py-3 text-sm font-semibold text-color3 border-2 border-color3 rounded-xl hover:bg-color3 hover:text-white transition">
                {t('nav.dashboard')}
              </button>
              <button onClick={() => { handleLogout(); setOpen(false) }}
                className="w-full py-3 text-sm font-semibold text-white bg-color1 rounded-xl hover:bg-color3 transition">
                {t('common.logout')}
              </button>
            </>
          ) : (
            <button onClick={() => { navigate("/login"); setOpen(false) }}
              className="w-full py-3 text-sm font-semibold text-white bg-color2 rounded-xl hover:bg-color3 transition">
              {t('auth.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default NavBar
