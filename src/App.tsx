import { Routes, Route, useLocation } from "react-router-dom";
//importing react slick slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { animateScroll } from "react-scroll";
import Home from "./components/pages/Home";
import { useEffect } from "react";
import Ticketdispo from "./components/pages/Ticketpage";
import Confimation from "./components/pages/Confirmationpage";
import Paiementdispo from "./components/pages/PaiementPage";
import AdminDashboard from "./components/pages/Admindashboard";
import Login from "./components/pages/Login";




function App() {
  const directory = useLocation();
  useEffect(() => {
    animateScroll.scrollToTop({
      duration: 0,
    });
  }, [directory.pathname]);

  return (
    <div className="w-full bg-white text-gray-950 font-poppins">
     
      <Routes>
        <Route path="/" element={<Home />} />  
        {<Route path="/ticket-details" element={<Ticketdispo/>} /> }
        {<Route path="/confirmation" element={<Confimation/>} /> }
         {<Route path="/pay" element={<Paiementdispo/>} /> }
        
           {<Route path="/admin/login" element={<Login/>} /> }
           <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
     
     
      
     

    </div>
  )
}

export default App
