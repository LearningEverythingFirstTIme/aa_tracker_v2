import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Calendar, CheckCircle2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

gsap.registerPlugin(ScrollTrigger);

export function HistorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const history = useStore((state) => state.history);
  const deleteHistoryItem = useStore((state) => state.deleteHistoryItem);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof history[0] | null>(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    date: '',
    meeting: '',
    role: 'Attendee' as typeof history[0]['role'],
  });

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const rows = rowsRef.current.filter(Boolean);

    if (!section || !header || rows.length === 0) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        header,
        { y: '4vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.5,
          },
        }
      );

      // Rows animation
      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { x: '-8vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: row,
              start: 'top 90%',
              end: 'top 65%',
              scrub: 0.5,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [history]);

  const handleEdit = (item: typeof history[0]) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      meeting: item.meeting,
      role: item.role,
    });
    setShowAddModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      meeting: '',
      role: 'Attendee',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      deleteHistoryItem(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { addHistoryItem, updateHistoryItem } = useStore.getState();
    
    if (editingItem) {
      updateHistoryItem(editingItem.id, formData);
    } else {
      addHistoryItem(formData);
    }
    
    setShowAddModal(false);
    setEditingItem(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="history"
        className="relative w-full min-h-screen bg-brutal-bg py-[8vh] z-50"
      >
        {/* Header */}
        <div ref={headerRef} className="px-[6vw] mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-clamp-h2 font-heading font-bold text-brutal-text">
                Recent Attendance
              </h2>
              <p className="text-clamp-body text-brutal-text-secondary mt-4 max-w-xl">
                A clear record keeps the story honest.
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="hidden md:flex items-center gap-2 brutal-btn"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="px-[6vw] space-y-3">
          {history.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => { rowsRef.current[i] = el; }}
              className="brutal-panel p-4 md:p-5 flex items-center gap-4 hover:border-l-brutal-yellow hover:border-l-[6px] transition-all cursor-pointer group"
            >
              {/* Date */}
              <div className="flex items-center gap-2 min-w-[100px]">
                <Calendar className="w-4 h-4 text-brutal-text-secondary" />
                <span className="font-mono text-sm text-brutal-text-secondary">{formatDate(item.date)}</span>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-brutal-text/10" />

              {/* Meeting Name */}
              <div className="flex-1 flex items-center gap-3">
                <User className="w-4 h-4 text-brutal-text-secondary group-hover:text-brutal-yellow transition-colors" />
                <span className="text-brutal-text font-medium">{item.meeting}</span>
              </div>

              {/* Role */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brutal-green" />
                <span className="font-mono text-sm uppercase tracking-wider text-brutal-text-secondary">
                  {item.role}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                  className="p-2 text-brutal-text-secondary hover:text-brutal-yellow transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="p-2 text-brutal-text-secondary hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Add Button */}
        <div className="px-[6vw] mt-8 md:hidden">
          <button
            onClick={handleAdd}
            className="w-full brutal-btn flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>

        {/* Load More */}
        <div className="px-[6vw] mt-8 text-center">
          <button className="px-6 py-3 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-yellow hover:text-brutal-yellow transition-colors font-mono text-sm uppercase tracking-wider">
            Load more history
          </button>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brutal-bg/90 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="brutal-panel w-full max-w-lg relative z-10">
            <div className="flex items-center justify-between p-6 border-b-2 border-brutal-text/10">
              <h2 className="text-xl font-heading font-bold text-brutal-text">
                {editingItem ? 'Edit Record' : 'Add Attendance Record'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="eyebrow block mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="eyebrow block mb-2">Meeting Name</label>
                <input
                  type="text"
                  value={formData.meeting}
                  onChange={(e) => setFormData({ ...formData, meeting: e.target.value })}
                  placeholder="e.g., Friday Night Lights"
                  className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="eyebrow block mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as typeof formData.role })}
                  className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Host">Host</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-text/40 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 brutal-btn py-3">
                  {editingItem ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
