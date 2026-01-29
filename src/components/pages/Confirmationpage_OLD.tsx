import Footer from "../organs/Footer"
import NavBar from "../organs/NavBar"
import Confirmation from "./Confirmation"





const  Confimation = () => {
    return (
        <>
       <div>
      {/* Navbar en haut */}
      <NavBar />

      {/* Contenu principal */}
      <div >
        <Confirmation />
      </div>

      {/* Footer en bas */}
    
      <Footer />
      
      

    </div>

           
        </>
    )
}

export default Confimation