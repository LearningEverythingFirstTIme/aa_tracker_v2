import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from './store/useStore';
import { Navigation } from './components/Navigation';
import { LoginPage } from './components/LoginPage';
import { HeroSection } from './sections/HeroSection';
import { StreakSection } from './sections/StreakSection';
import { TreasurySection } from './sections/TreasurySection';
import { MeetingsSection } from './sections/MeetingsSection';
import { HistorySection } from './sections/HistorySection';
import { FooterSection } from './sections/FooterSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [activeSection] = useState('dashboard');
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Skip complex scroll snap on mobile
    if (isMobile) {
      setIsReady(true);
      return;
    }

    // Wait for all sections to mount and create their ScrollTriggers
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll || pinned.length === 0) {
        setIsReady(true);
        return;
      }

      // Build ranges and snap targets from pinned sections
      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Create global snap
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;
            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });

      setIsReady(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, isMobile]);

  // Handle reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      ScrollTrigger.getAll().forEach((st) => st.disable());
    }
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        ScrollTrigger.getAll().forEach((st) => st.disable());
      } else {
        ScrollTrigger.getAll().forEach((st) => st.enable());
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Cleanup ScrollTrigger on unmount
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="relative bg-brutal-bg min-h-screen">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navigation activeSection={activeSection} />

      {/* Main Content */}
      <main className={`relative transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        <HeroSection />
        <StreakSection />
        <TreasurySection />
        <MeetingsSection />
        <HistorySection />
        <FooterSection />
      </main>
    </div>
  );
}

export default App;
