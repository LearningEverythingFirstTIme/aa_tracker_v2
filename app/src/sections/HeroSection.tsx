import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, ArrowRight, Menu, X } from 'lucide-react';
import { CheckInModal } from '../components/CheckInModal';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const header = headerRef.current;

    if (!section || !leftPanel || !rightPanel || !header) return;

    // Skip GSAP animations on mobile for better performance
    if (isMobile) {
      // Make sure panels are visible without animation
      gsap.set([header, leftPanel, rightPanel], { opacity: 1, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Auto-play entrance animation on page load
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      loadTl
        .fromTo(header, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo(leftPanel, { x: '-60vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 0.1)
        .fromTo(rightPanel, { x: '60vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 0.15);

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            gsap.set([leftPanel, rightPanel], { x: 0, opacity: 1 });
          },
        },
      });

      scrollTl
        .fromTo(leftPanel, { x: 0, opacity: 1 }, { x: '-40vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(rightPanel, { x: 0, opacity: 1 }, { x: '40vw', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);

    return () => ctx.revert();
  }, [isMobile]);

  const scrollToHistory = () => {
    const element = document.getElementById('history');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="dashboard"
        className="relative w-full min-h-screen bg-brutal-bg overflow-hidden z-10"
      >
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,12,15,0.4)_100%)]" />

        {/* Header */}
        <div ref={headerRef} className="absolute top-0 left-0 right-0 z-50 px-4 md:px-[4vw] py-4 md:py-[3vh]">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-xl md:text-2xl text-brutal-text">AA Tracker</span>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {['Dashboard', 'Meetings', 'History', 'Treasury'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="font-mono text-sm uppercase tracking-wider text-brutal-text-secondary hover:text-brutal-text transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 text-brutal-text relative z-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div 
              className="md:hidden absolute top-full left-0 right-0 bg-brutal-bg border-b-2 border-brutal-text/10 p-4 z-40 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {['Dashboard', 'Meetings', 'History', 'Treasury'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left py-3 font-mono text-sm uppercase tracking-wider text-brutal-text-secondary hover:text-brutal-text transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Container - Mobile: stacked, Desktop: side by side */}
        <div className="relative w-full min-h-screen flex flex-col md:flex-row items-center justify-center px-4 md:px-[6vw] pt-20 md:pt-[10vh] pb-8 md:pb-0 gap-4 md:gap-0">
          {/* Left Panel - Greeting */}
          <div
            ref={leftPanelRef}
            className="brutal-panel w-full md:absolute md:left-[6vw] md:top-[18vh] md:w-[46vw] md:h-[64vh] p-6 md:p-8 flex flex-col justify-between"
          >
            <div>
              <span className="eyebrow">Dashboard</span>
              <h1 className="text-3xl md:text-clamp-h1 font-heading font-bold text-brutal-text mt-4 md:mt-6">
                Welcome back.
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-brutal-text-secondary mt-4 font-heading">
                One day. One meeting. One block.
              </p>
            </div>

            <div>
              <p className="text-sm md:text-clamp-body text-brutal-text-secondary max-w-md">
                Track attendance, keep your streak alive, and stay honest with the treasury.
              </p>
              {/* Decorative bracket motif */}
              <div className="mt-6 md:mt-8 flex gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-brutal-text/30" />
                <div className="w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-brutal-text/20" />
              </div>
            </div>
          </div>

          {/* Right Panel - Check In */}
          <div
            ref={rightPanelRef}
            className="brutal-panel w-full md:absolute md:left-[54vw] md:top-[18vh] md:w-[40vw] md:h-[64vh] p-6 md:p-8 flex flex-col"
          >
            {/* Status dot */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-brutal-text-secondary hidden sm:inline">
                Ready
              </span>
              <div className="w-3 h-3 rounded-full bg-brutal-green animate-pulse" />
            </div>

            <div className="mt-4 md:mt-8">
              <h2 className="text-2xl md:text-clamp-h2 font-heading font-bold text-brutal-text">Check In</h2>
              <p className="text-sm md:text-clamp-body text-brutal-text-secondary mt-4">
                Attended a meeting? Log it now and keep the streak going. Multiple check-ins per day supported.
              </p>
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={() => setShowCheckInModal(true)}
                className="w-full flex items-center justify-center gap-3 text-base md:text-lg px-4 md:px-6 py-3 rounded-[10px] border-[3px] border-[#F4F6FA] transition-all bg-brutal-yellow text-brutal-bg font-semibold shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5" />
                Check In Now
              </button>

              <button 
                onClick={scrollToHistory}
                className="mt-4 w-full flex items-center justify-center gap-2 text-brutal-text-secondary hover:text-brutal-yellow transition-colors font-mono text-sm uppercase tracking-wider"
              >
                View history
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Check In Modal */}
      <CheckInModal 
        isOpen={showCheckInModal} 
        onClose={() => setShowCheckInModal(false)} 
      />
    </>
  );
}
