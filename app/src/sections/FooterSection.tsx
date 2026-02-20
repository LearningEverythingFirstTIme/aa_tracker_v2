import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, ArrowUp, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CheckInModal } from '../components/CheckInModal';

gsap.registerPlugin(ScrollTrigger);

export function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaTileRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  const canCheckInToday = useStore((state) => state.canCheckInToday());
  const logout = useStore((state) => state.logout);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const ctaTile = ctaTileRef.current;
    const footer = footerRef.current;

    if (!section || !ctaTile || !footer) return;

    const ctx = gsap.context(() => {
      // CTA tile animation
      gsap.fromTo(
        ctaTile,
        { scale: 0.96, y: '6vh', opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: ctaTile,
            start: 'top 85%',
            end: 'top 50%',
            scrub: 0.6,
          },
        }
      );

      // Footer fade in
      gsap.fromTo(
        footer,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%',
            end: 'top 80%',
            scrub: 0.5,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const footerLinks = [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Meetings', id: 'meetings' },
    { label: 'History', id: 'history' },
    { label: 'Treasury', id: 'treasury' },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full bg-brutal-bg pt-[10vh] pb-[6vh] z-[60]"
      >
        {/* CTA Tile */}
        <div className="px-[6vw] mb-12">
          <div
            ref={ctaTileRef}
            className="brutal-panel w-full min-h-[44vh] p-8 md:p-12 flex flex-col items-center justify-center text-center"
          >
            <h2 className="text-clamp-h2 font-heading font-bold text-brutal-text mb-4">
              Keep building the streak.
            </h2>
            <p className="text-clamp-body text-brutal-text-secondary max-w-lg mb-8">
              Check in today. The next 24 hours are the only ones that matter. Multiple meetings? Log them all.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setShowCheckInModal(true)}
                className="flex items-center gap-3 px-6 py-3 rounded-[10px] border-[3px] border-[#F4F6FA] transition-all bg-brutal-yellow text-brutal-bg font-semibold shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5" />
                Check In Now
              </button>

              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-brutal-text-secondary hover:text-brutal-yellow transition-colors font-mono text-sm uppercase tracking-wider"
              >
                <ArrowUp className="w-4 h-4" />
                Back to top
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          ref={footerRef}
          className="px-[6vw] pt-[4vh] border-t-2 border-brutal-text/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-brutal-text-secondary">
              <span className="font-mono text-sm">© 2026 AA Tracker</span>
              <span className="text-brutal-text/20">|</span>
              <span className="flex items-center gap-1 text-xs">
                Built with <Heart className="w-3 h-3 text-brutal-yellow fill-brutal-yellow" /> for recovery
              </span>
            </div>

            {/* Footer Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {footerLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="font-mono text-sm uppercase tracking-wider text-brutal-text-secondary hover:text-brutal-text transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="font-mono text-sm uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </footer>
      </section>

      {/* Check In Modal */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
      />
    </>
  );
}
