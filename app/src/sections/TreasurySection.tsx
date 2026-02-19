import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wallet, Plus, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { LedgerModal } from '../components/LedgerModal';

gsap.registerPlugin(ScrollTrigger);

export function TreasurySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftTileRef = useRef<HTMLDivElement>(null);
  const rightTileRef = useRef<HTMLDivElement>(null);
  
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const getBalance = useStore((state) => state.getBalance);
  const getAverageContribution = useStore((state) => state.getAverageContribution);
  const checkIns = useStore((state) => state.checkIns);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const leftTile = leftTileRef.current;
    const rightTile = rightTileRef.current;

    if (!section || !leftTile || !rightTile) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0-30%): Tiles slide in from sides
      scrollTl
        .fromTo(leftTile, { x: '-70vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(rightTile, { x: '70vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0);

      // EXIT (70-100%): Tiles slide out
      scrollTl
        .fromTo(leftTile, { x: 0, opacity: 1 }, { x: '-40vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(rightTile, { x: 0, opacity: 1 }, { x: '40vw', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);

    return () => ctx.revert();
  }, []);

  // Get recent attended meetings (last 3)
  const recentMeetings = checkIns.slice(0, 3).map((checkIn) => ({
    name: checkIn.meetingName,
    date: new Date(checkIn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const balance = getBalance();
  const average = getAverageContribution();

  return (
    <>
      <section
        ref={sectionRef}
        id="treasury"
        className="relative w-full h-screen bg-brutal-violet overflow-hidden z-30"
      >
        {/* Left Tile - Treasury */}
        <div
          ref={leftTileRef}
          className="brutal-panel absolute left-[6vw] top-[16vh] w-[46vw] h-[68vh] p-6 md:p-8 flex flex-col"
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-brutal-yellow" />
            <span className="eyebrow">Treasury</span>
          </div>

          <div className="mt-6">
            <span className="text-clamp-h1 font-heading font-bold text-brutal-text">
              ${balance.toFixed(2)}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-brutal-green" />
              <p className="text-clamp-body text-brutal-text-secondary">
                7-day average: ${average.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setShowLedgerModal(true)}
              className="brutal-btn w-full flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Add Contribution
            </button>

            <button 
              onClick={() => setShowLedgerModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-brutal-text-secondary hover:text-brutal-yellow transition-colors font-mono text-sm uppercase tracking-wider"
            >
              View ledger
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Tile - Attendance */}
        <div
          ref={rightTileRef}
          className="brutal-panel absolute left-[54vw] top-[16vh] w-[40vw] h-[68vh] p-6 md:p-8 flex flex-col"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-brutal-yellow" />
            <span className="eyebrow">Recently Attended</span>
          </div>

          <div className="mt-6 space-y-3 flex-1">
            {recentMeetings.length === 0 ? (
              <p className="text-brutal-text-secondary text-center py-8">No meetings attended yet</p>
            ) : (
              recentMeetings.map((meeting, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border-2 border-brutal-text/10 rounded-lg hover:border-brutal-yellow/50 transition-colors"
                >
                  <span className="text-brutal-text font-medium">{meeting.name}</span>
                  <span className="font-mono text-sm text-brutal-text-secondary">{meeting.date}</span>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => document.getElementById('meetings')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-4 w-full flex items-center justify-center gap-2 text-brutal-text-secondary hover:text-brutal-yellow transition-colors font-mono text-sm uppercase tracking-wider"
          >
            See all meetings
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Ledger Modal */}
      <LedgerModal 
        isOpen={showLedgerModal} 
        onClose={() => setShowLedgerModal(false)} 
      />
    </>
  );
}
