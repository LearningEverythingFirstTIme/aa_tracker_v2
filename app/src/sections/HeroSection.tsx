import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CheckInModal } from '../components/CheckInModal';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const canCheckInToday = useStore((state) => state.canCheckInToday());
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const header = headerRef.current;

    if (!section || !leftPanel || !rightPanel || !header) return;

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
  }, []);

  const scrollToHistory = () => {
    const element = document.getElementById('history');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="dashboard"
        className="relative w-full h-screen bg-brutal-bg overflow-hidden z-10"
      >
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,12,15,0.4)_100%)]" />

        {/* Header */}
        <div ref={headerRef} className="absolute top-0 left-0 right-0 z-20 px-[4vw] py-[3vh]">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-2xl text-brutal-text">AA Tracker</span>
            <nav className="hidden md:flex items-center gap-6">
              {['Dashboard', 'Meetings', 'History', 'Treasury'].map((item) => (
                <button
                  key={item}
                  className="font-mono text-sm uppercase tracking-wider text-brutal-text-secondary hover:text-brutal-text transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative w-full h-full flex items-center px-[6vw] pt-[10vh]">
          {/* Left Panel - Greeting */}
          <div
            ref={leftPanelRef}
            className="brutal-panel absolute left-[6vw] top-[18vh] w-[46vw] h-[64vh] p-8 flex flex-col justify-between"
          >
            <div>
              <span className="eyebrow">Dashboard</span>
              <h1 className="text-clamp-h1 font-heading font-bold text-brutal-text mt-6">
                Welcome back.
              </h1>
              <p className="text-xl md:text-2xl text-brutal-text-secondary mt-4 font-heading">
                One day. One meeting. One block.
              </p>
            </div>

            <div>
              <p className="text-clamp-body text-brutal-text-secondary max-w-md">
                Track attendance, keep your streak alive, and stay honest with the treasury.
              </p>
              {/* Decorative bracket motif */}
              <div className="mt-8 flex gap-2">
                <div className="w-8 h-8 border-l-2 border-b-2 border-brutal-text/30" />
                <div className="w-4 h-4 border-l-2 border-b-2 border-brutal-text/20" />
              </div>
            </div>
          </div>

          {/* Right Panel - Check In */}
          <div
            ref={rightPanelRef}
            className="brutal-panel absolute left-[54vw] top-[18vh] w-[40vw] h-[64vh] p-8 flex flex-col"
          >
            {/* Status dot */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-brutal-text-secondary">
                {canCheckInToday ? 'Ready' : 'Checked In'}
              </span>
              <div className={`w-3 h-3 rounded-full ${canCheckInToday ? 'bg-brutal-green animate-pulse' : 'bg-brutal-gray'}`} />
            </div>

            <div className="mt-8">
              <h2 className="text-clamp-h2 font-heading font-bold text-brutal-text">Check In</h2>
              <p className="text-clamp-body text-brutal-text-secondary mt-4">
                {canCheckInToday 
                  ? "Attended a meeting today? Log it now and keep the streak going."
                  : "You've already checked in today. Great job!"
                }
              </p>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => canCheckInToday && setShowCheckInModal(true)}
                disabled={!canCheckInToday}
                className={`w-full flex items-center justify-center gap-3 text-lg px-6 py-3 rounded-[10px] border-[3px] border-[#F4F6FA] transition-all ${
                  canCheckInToday 
                    ? 'bg-brutal-yellow text-brutal-bg font-semibold shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5' 
                    : 'bg-brutal-text/10 text-brutal-text-secondary cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {canCheckInToday ? 'Check In Today' : 'Already Checked In'}
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
