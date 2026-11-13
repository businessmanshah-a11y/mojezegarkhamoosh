import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { FeaturedVideoSection } from './components/FeaturedVideoSection';
import { AudiobookSection } from './components/AudiobookSection';
import { PhilosophySection } from './components/PhilosophySection';
import { ServicesSection } from './components/ServicesSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Ultra-smooth buttery momentum scroll powered by Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    let animationFrameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-gold-500/30 selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturedVideoSection />
        <AudiobookSection />
        <PhilosophySection />
        <ServicesSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
