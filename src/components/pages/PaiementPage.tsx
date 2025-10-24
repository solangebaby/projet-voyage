import Footer from "../organs/Footer"
import NavBar from "../organs/NavBar"
import Payment from "./Payment"


const  Paiementdispo = () => {
    return (
        <>
       <div>
      {/* Navbar en haut */}
      <NavBar />

      {/* Contenu principal */}
      <div >
        <Payment />
      </div>

      {/* Footer en bas */}
      <Footer />
    </div>

           
        </>
    )
}

export default Paiementdispo