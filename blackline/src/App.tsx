import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Manifesto } from './components/Manifesto';
import { Services } from './components/Services';
import { Gallery } from './components/Gallery';
import { Barbers } from './components/Barbers';
import { Booking } from './components/booking/Booking';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { StickyCta } from './components/StickyCta';
import { useRevealObserver } from './hooks/useReveal';

export default function App() {
  useRevealObserver();
  return (
    <>
      <a className="skip" href="#manifesto">Перейти к содержанию</a>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Services />
        <Gallery />
        <Barbers />
        <Booking />
        <Location />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
