import BookingSteps from "../organs/BookingSteps";
import Footer from "../organs/Footer";
import HeroSection from "../organs/HeroSection";
import NavBar from "../organs/NavBar";
import Partners from "../organs/Partners";
import Services from "../organs/Services";
import Testimonials from "../organs/Testimonials";
import TopDestination from "../organs/TopDestination";
import VideoSection from "../organs/VideoSection";

const Home = () => {
  return (
    <>
      <NavBar />
      <HeroSection />
      <section id="services">
        <Services />
      </section>
      <section id="destinations">
        <TopDestination />
      </section>
      <BookingSteps />
      <section id="about">
        <VideoSection />
      </section>
      <Testimonials />
      <Partners />
      <Footer />
    </>
  );
};

export default Home;