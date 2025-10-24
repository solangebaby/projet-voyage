import Footer from "../organs/Footer"
import NavBar from "../organs/NavBar"
import Confirmation from "./Confirmation"

import Tickets from "./Tickets"

const  Ticketdispo = () => {
    return (
        <>
       <div>
      {/* Navbar en haut */}
      <NavBar />

      {/* Contenu principal */}
      <div >
        <Tickets />
      </div>

      {/* Footer en bas */}
    
      <Footer />
      
      

    </div>

           
        </>
    )
}

export default Ticketdispo