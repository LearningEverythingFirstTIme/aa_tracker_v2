import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, ArrowUpRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MeetingModal } from '../components/MeetingModal';
import { useIsMobile } from '../hooks/use-mobile';

gsap.registerPlugin(ScrollTrigger);

export function MeetingsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const meetings = useStore((state) => state.meetings);
  const deleteMeeting = useStore((state) => state.deleteMeeting);
  
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<typeof meetings[0] | null>(null);
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !header || cards.length === 0) return;
    
    // Skip GSAP on mobile for better performance
    if (isMobile) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        header,
        { x: '-12vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: header,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.4,
          },
        }
      );

      // Cards animation
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: '10vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 60%',
              scrub: 0.5,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [meetings, isMobile]);

  const handleEdit = (meeting: typeof meetings[0]) => {
    setEditingMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleAdd = () => {
    setEditingMeeting(null);
    setShowMeetingModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      deleteMeeting(id);
    }
  };

  const handleCloseModal = () => {
    setShowMeetingModal(false);
    setEditingMeeting(null);
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="meetings"
        className="relative w-full min-h-screen bg-brutal-bg py-16 md:py-[8vh] z-40"
      >
        {/* Header */}
        <div ref={headerRef} className="px-4 md:px-[6vw] mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-clamp-h2 font-heading font-bold text-brutal-text">
                Upcoming Meetings
              </h2>
              <p className="text-sm md:text-clamp-body text-brutal-text-secondary mt-2 md:mt-4 max-w-xl">
                Show up early. Stay after. That's where the real work happens.
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="hidden md:flex items-center gap-2 brutal-btn"
            >
              <Plus className="w-4 h-4" />
              Add Meeting
            </button>
          </div>
        </div>

        {/* Meeting Cards */}
        <div className="px-4 md:px-[6vw] space-y-4">
          {meetings.length === 0 && (
            <div className="text-center py-16 text-brutal-text-secondary">
              <p className="text-lg font-heading">No meetings added yet.</p>
              <p className="text-sm mt-2">Add a meeting to start tracking attendance.</p>
            </div>
          )}
          {meetings.map((meeting, i) => (
            <div
              key={meeting.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="brutal-panel p-4 md:p-6 hover:md:translate-y-[-6px] hover:md:shadow-brutal-hover transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-brutal-text group-hover:text-brutal-yellow transition-colors truncate">
                      {meeting.name}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-brutal-text-secondary group-hover:text-brutal-yellow transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-brutal-text-secondary">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="font-mono">{meeting.day}s at {meeting.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brutal-text-secondary">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{meeting.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-0">
                  <span className="px-2 md:px-3 py-1 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-full text-xs font-mono uppercase tracking-wider text-brutal-text-secondary">
                    {meeting.type}
                  </span>
                  
                  {/* Action buttons - always visible on mobile */}
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(meeting); }}
                      className="p-2 text-brutal-text-secondary hover:text-brutal-yellow transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(meeting.id); }}
                      className="p-2 text-brutal-text-secondary hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Add Button */}
        <div className="px-4 md:px-[6vw] mt-6 md:mt-8 md:hidden">
          <button
            onClick={handleAdd}
            className="w-full brutal-btn flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Meeting
          </button>
        </div>
      </section>

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={showMeetingModal}
        onClose={handleCloseModal}
        meeting={editingMeeting}
      />
    </>
  );
}
