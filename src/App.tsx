import { Routes, Route, useLocation } from "react-router-dom";
//importing react slick slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { animateScroll } from "react-scroll";
import Home from "./components/pages/Home";
import { useEffect } from "react";

import Ticketdispo from "./components/pages/Ticketpage";
import Payment from "./components/pages/Payment";



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
        {<Route path="/payment" element={<Payment/>} /> }
      </Routes>
     
      
     

    </div>
  )
}

export default App
