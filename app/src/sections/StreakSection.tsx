import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../store/useStore';

gsap.registerPlugin(ScrollTrigger);

export function StreakSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tileARef = useRef<HTMLDivElement>(null);
  const tileBRef = useRef<HTMLDivElement>(null);
  const tileCRef = useRef<HTMLDivElement>(null);

  const currentStreak = useStore((state) => state.currentStreak);
  const longestStreak = useStore((state) => state.longestStreak);
  const getTotalCheckIns = useStore((state) => state.getTotalCheckIns);
  const getLastCheckIn = useStore((state) => state.getLastCheckIn);
  const getAttendedThisWeek = useStore((state) => state.getAttendedThisWeek);
  const checkIns = useStore((state) => state.checkIns);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const tileA = tileARef.current;
    const tileB = tileBRef.current;
    const tileC = tileCRef.current;

    if (!section || !tileA || !tileB || !tileC) return;

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

      // ENTRANCE (0-30%): Tiles slide in from sides and bottom
      scrollTl
        .fromTo(tileA, { x: '-60vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(tileB, { x: '60vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(tileC, { y: '60vh', opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.05);

      // EXIT (70-100%): Tiles slide out
      scrollTl
        .fromTo(tileA, { x: 0, opacity: 1 }, { x: '-35vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(tileB, { x: 0, opacity: 1 }, { x: '35vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(tileC, { y: 0, opacity: 1 }, { y: '30vh', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);

    return () => ctx.revert();
  }, []);

  // Calculate week days with check-in status
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const getWeekCheckIns = () => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    return weekDays.map((day, index) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + index);
      const dateStr = d.toISOString().split('T')[0];
      const hasCheckIn = checkIns.some((c) => c.date === dateStr);
      const isToday = index === dayOfWeek;
      return { day, filled: hasCheckIn, isToday };
    });
  };

  const weekStatus = getWeekCheckIns();
  const attendedThisWeek = getAttendedThisWeek();

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-brutal-bg overflow-hidden z-20"
    >
      {/* Top Row - Two Tiles */}
      <div
        ref={tileARef}
        className="brutal-panel absolute left-[6vw] top-[14vh] w-[44vw] h-[34vh] p-6 md:p-8"
      >
        <span className="eyebrow">Current Streak</span>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-clamp-h1 font-heading font-bold text-brutal-text">{currentStreak}</span>
          <span className="text-2xl text-brutal-text-secondary font-heading">days</span>
        </div>
        <p className="text-clamp-body text-brutal-text-secondary mt-4 max-w-sm">
          Keep showing up. The next mile is built one block at a time.
        </p>
      </div>

      <div
        ref={tileBRef}
        className="brutal-panel absolute left-[52vw] top-[14vh] w-[42vw] h-[34vh] p-6 md:p-8"
      >
        <span className="eyebrow">This Week</span>
        <div className="mt-4 flex items-center gap-3">
          {weekStatus.map((d, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-medium transition-all ${
                d.filled
                  ? 'bg-brutal-yellow text-brutal-bg animate-pulse-subtle'
                  : d.isToday
                  ? 'border-2 border-brutal-yellow text-brutal-yellow'
                  : 'border-2 border-brutal-text/30 text-brutal-text-secondary'
              }`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-heading font-bold text-brutal-text">{attendedThisWeek}</span>
          <span className="text-brutal-text-secondary">/ 7</span>
        </div>
        <p className="text-clamp-body text-brutal-text-secondary mt-2">
          Aim for 7. Progress, not perfection.
        </p>
      </div>

      {/* Bottom Row - Wide Stats Tile */}
      <div
        ref={tileCRef}
        className="brutal-panel absolute left-[6vw] top-[52vh] w-[88vw] h-[34vh] p-6 md:p-8"
      >
        <div className="h-full flex items-center justify-around">
          <div className="text-center">
            <span className="eyebrow block mb-2">Total Check-Ins</span>
            <span className="text-clamp-h2 font-heading font-bold text-brutal-text">{getTotalCheckIns()}</span>
          </div>

          <div className="w-px h-16 bg-brutal-text/20" />

          <div className="text-center">
            <span className="eyebrow block mb-2">Longest Streak</span>
            <span className="text-clamp-h2 font-heading font-bold text-brutal-text">{longestStreak}</span>
            <span className="text-brutal-text-secondary ml-2">days</span>
          </div>

          <div className="w-px h-16 bg-brutal-text/20" />

          <div className="text-center">
            <span className="eyebrow block mb-2">Last Check-In</span>
            <span className="text-clamp-h2 font-heading font-bold text-brutal-text">{getLastCheckIn()}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
